/* eslint-disable ts/no-unsafe-type-assertion */
/* eslint-disable ts/naming-convention */

// Builds a map associating file extensions with vscode language IDs
// Checks all extensions bundled with VS Code, and also all extensions in
// the "Programming Languages" category on the VS Code marketplace
// Saves resulting associations to a JSON file with the format:
// {
//  "file extension": ["vscodeLanguageId", "vscodeLanguageId"...]
// }
// This ensures that snip files associated with various file extensions are correctly associated with
// the right VS Code languageIDs in the global VS Code snippets file snip writes
// Arguably we could just create this map from the user's installed extensions, but if a user installs
// a language extension after syncing their snippets to VS Code, then they would not have the correct
// associations for their new extension in their global VS Code snippets file (TODO do it anyway and merge with the map...)
// Information relevant to the undocumented marketplace.visualstudio.com/_apis endpoints:
// https://github.com/microsoft/vscode/blob/main/src/vs/platform/extensionManagement/common/extensionGalleryService.ts
// Feasibility of marketplace API access encouraged by:
// https://www.powershellgallery.com/packages/BcContainerHelper/1.0.18-preview300/Content/ContainerHandling%5CGet-LatestAlLanguageExtensionUrl.ps1

import * as fs from 'node:fs/promises'

type LanguageMap = Map<string, Set<string>>

async function getResolvedPromises<T>(promises: Array<Promise<T>>, logErrors = false) {
	const results = await Promise.allSettled(promises)
	return results
		.filter((result) => {
			if (result.status === 'fulfilled') return true
			if (logErrors) console.error('Error from getResolvedPromises:\n', result.reason)
			return false
		})
		.map((result) => (result as PromiseFulfilledResult<T>).value)
}

// Extension manifest type specification:
// https://github.com/microsoft/vscode/blob/main/src/vs/platform/extensions/common/extensions.ts#L264-L291
// https://stackoverflow.com/questions/70629292/does-the-vscode-extension-package-json-have-an-official-schema/78536803#78536803
// This type is available in the VS Code source code, but it's buried and I can't get it out of the available packages...
// There's a lot more to the manifest, but this is what we touch
type VSCodeExtensionManifest = {
	contributes?: {
		languages?: Array<{
			aliases: string[]
			extensions: string[]
			id: string
		}>
	}
	name: string
}

// TODO get this from a JSON Schema somewhere?
type VSCodeExtensionInfo = {
	_links: {
		git: string
		html: string
		self: string
	}
	download_url: string | undefined
	git_url: string
	html_url: string
	name: string
	path: string
	sha: string
	size: number
	type: 'dir' | 'file'
	url: string
}

type MarketplaceExtension = {
	extensionId: string
	extensionName: string
	versions: Array<{
		files: Array<{
			source?: string
		}>
		lastUpdated: string
		version: string
	}>
}

type MarketplaceExtensionsResponse = {
	extensions: MarketplaceExtension[]
	totalCount: number
}

type RawMarketplaceExtensionsResponse = {
	results: Array<{
		extensions: MarketplaceExtension[]
		resultMetadata: Array<{
			metadataItems: Array<{
				count: number
			}>
		}>
	}>
}

function cleanExtensions(extensions: string[]): string[] {
	// Handle bad formats where multiple extensions are defined in a string
	// e.g. .nc .cnc .ngc .gc .tap .gcode .ncp
	// any duplicates will be taken care of by a set later on
	return extensions
		.flatMap((value) => value.split(' '))
		.map((extension) => extension.toLowerCase().replace('..', '.'))
		.filter(
			(extension) =>
				// ignore non-extension extensions
				extension !== '.' && extension !== '.*' && extension.startsWith('.'),
		)
}

// Helper to pull language data out of extension manifests
function addLanguagesToMapFromManifest(
	languageMap: LanguageMap,
	manifest: VSCodeExtensionManifest,
): LanguageMap {
	if (manifest.contributes?.languages === undefined) {
		console.warn(`Warning: No languages key found in manifest for "${manifest.name}"`)
		return languageMap
	}

	for (const language of manifest.contributes.languages) {
		// eslint-disable-next-line ts/no-unnecessary-condition
		for (const extension of cleanExtensions(language.extensions ?? [])) {
			if (!languageMap.has(extension)) {
				languageMap.set(extension, new Set())
			}

			languageMap.get(extension)?.add(language.id)
		}
	}

	return languageMap
}

/**
 * Gets extensions from the marketplace
 */
export async function getExtensions(
	pageNumber = 1,
	pageSize = 100,
	programmingLanguagesCategoryOnly = true,
): Promise<MarketplaceExtensionsResponse> {
	const requestBody = {
		assetTypes: ['Microsoft.VisualStudio.Code.Manifest'],
		filters: [
			{
				criteria: [
					// https://github.com/microsoft/vscode/blob/3e47253e4694be3f42c9e173855654a6624409ce/src/vs/platform/extensionManagement/common/extensionGalleryService.ts#L185-L194
					{ filterType: 8, value: 'Microsoft.VisualStudio.Code' }, // Target
					{ filterType: 10, value: 'target:"Microsoft.VisualStudio.Code" ' }, // SearchText
					{ filterType: 12, value: '37888' }, // ExcludeWithFlags not clear...
				],
				direction: 2, // Probably descending
				pageNumber,
				pageSize,
				pagingToken: undefined,
				// https://github.com/microsoft/vscode/blob/0b45f091d33f482e626cedde71d9f2f1912c3520/src/vs/platform/extensionManagement/common/extensionManagement.ts#L269-L278
				sortBy: 4, // Install count
				// https://github.com/microsoft/vscode/blob/0b45f091d33f482e626cedde71d9f2f1912c3520/src/vs/platform/extensionManagement/common/extensionManagement.ts#L280-L284
				sortOrder: 2, // Descending
			},
		],
		// https://github.com/microsoft/vscode/blob/3e47253e4694be3f42c9e173855654a6624409ce/src/vs/platform/extensionManagement/common/extensionGalleryService.ts#L101-L179
		// eslint-disable-next-line no-bitwise
		flags: 0x2 | 0x2_00, // Files + latest version only
	}

	if (programmingLanguagesCategoryOnly) {
		requestBody.filters[0].criteria.push({ filterType: 5, value: 'Programming Languages' }) // Category
	}

	// eslint-disable-next-line node/no-unsupported-features/node-builtins
	const response = await fetch(
		'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
		{
			body: JSON.stringify(requestBody),
			headers: {
				Accept: 'application/json;api-version=7.1-preview.1;excludeUrls=true',
				'Accept-encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.9',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		},
	)

	const data = (await response.json()) as RawMarketplaceExtensionsResponse

	return {
		extensions: data.results[0].extensions,
		totalCount: data.results[0].resultMetadata[0].metadataItems[0].count,
	}
}

async function getManifestFromUrl(manifestUrl: string): Promise<VSCodeExtensionManifest> {
	// eslint-disable-next-line node/no-unsupported-features/node-builtins
	const manifestResponse = await fetch(manifestUrl)

	if (manifestResponse.status !== 200) {
		throw new Error(`Manifest not found at: ${manifestUrl}`)
	}

	// eslint-disable-next-line ts/no-unsafe-assignment
	const manifest = await manifestResponse.json()
	return manifest as VSCodeExtensionManifest
}

// Gets bundled extensions from VS Code source
async function getProgrammingLanguageIdsFromBundledExtensions(
	extensionLanguageIds: LanguageMap = new Map(),
): Promise<LanguageMap> {
	// Get list of bundled extensions from extensions folder
	// eslint-disable-next-line node/no-unsupported-features/node-builtins
	const response = await fetch('https://api.github.com/repos/microsoft/vscode/contents/extensions')
	const directoryList = (await response.json()) as VSCodeExtensionInfo[]

	const manifestUrls = directoryList.flatMap((value) => {
		if (value.type === 'dir') {
			return [
				`https://raw.githubusercontent.com/microsoft/vscode/main/extensions/${value.name}/package.json`,
			]
		}

		return []
	})

	const manifests = await getResolvedPromises(
		manifestUrls.map(async (manifestUrl) => getManifestFromUrl(manifestUrl)),
		true,
	)

	for (const manifest of manifests) {
		extensionLanguageIds = addLanguagesToMapFromManifest(extensionLanguageIds, manifest)
	}

	console.log(`${extensionLanguageIds.size} language ids found in bundled extensions`)

	return extensionLanguageIds
}

async function getLanguageIDsFromExtensionsMarketplace(
	extensionLanguageIds: LanguageMap = new Map(),
	programmingLanguagesCategoryOnly = true,
): Promise<LanguageMap> {
	const pageSize = 100
	const maxResults = Number.MAX_SAFE_INTEGER
	// Cap results for development:
	// const maxResults = 100

	// Get total count
	const { totalCount } = await getExtensions(1, 1, programmingLanguagesCategoryOnly)
	const totalPages = Math.ceil(Math.min(totalCount, maxResults) / pageSize)

	console.log(
		`Found ${totalCount} results to be queried across ${totalPages} requests at ${pageSize} results per page`,
	)

	for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
		const { extensions } = await getExtensions(
			currentPage,
			pageSize,
			programmingLanguagesCategoryOnly,
		)

		const manifestUrls = extensions.flatMap((extension) =>
			extension.versions.map((version) => version.files[0]?.source ?? ''),
		)

		const manifests = await getResolvedPromises(
			manifestUrls.map(async (manifestUrl) => getManifestFromUrl(manifestUrl)),
			true,
		)

		for (const manifest of manifests) {
			extensionLanguageIds = addLanguagesToMapFromManifest(extensionLanguageIds, manifest)
		}

		console.log(
			`${extensionLanguageIds.size} language ids found, on page ${currentPage} of ${totalPages}`,
		)
	}

	return extensionLanguageIds
}

async function updateVsCodeLanguageData() {
	let extensionLanguageIds: LanguageMap = new Map()

	extensionLanguageIds = await getProgrammingLanguageIdsFromBundledExtensions(extensionLanguageIds)
	extensionLanguageIds = await getLanguageIDsFromExtensionsMarketplace(extensionLanguageIds, false)

	// Convert map set to object for json conversion
	const fileExtensionCount = extensionLanguageIds.size
	let languageIdCount = 0
	const extensionLanguageIdsObject: Record<string, string[]> = {}
	for (const [extensionKey, languageIdSet] of extensionLanguageIds.entries()) {
		languageIdCount += languageIdSet.size
		extensionLanguageIdsObject[extensionKey] = [...languageIdSet]
	}

	console.log(`Found ${fileExtensionCount} file extensions and ${languageIdCount} language IDs`)

	// Save to file in data folder
	await fs.writeFile(
		'./src/generated/vscode-language-map.json',
		JSON.stringify(extensionLanguageIdsObject, undefined, 2),
		{
			flag: 'w',
		},
	)
}

await updateVsCodeLanguageData()
