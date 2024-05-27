/* eslint-disable max-depth */

// Builds a map associating file extensions with vscode language IDs
// Checks all extensions bundled with VSCode, and also all extensions in
// the "Programming Languages" category on the VSCode marketplace
// Saves resulting associations to a JSON file with the format:
// {
//  "file extension": ["vscodeLanguageId", "vscodeLanguageId"...]
// }
// This ensures that snipster files associated with various file extensions are correctly associated with
// the right VSCode languageIDs in the global VSCode snippets file snipster writes
// Arguably we could just create this map from the user's installed extensions, but if a user installs
// a language extension after syncing their snippets to VSCode, then they would not have the correct
// associations for their new extension in their global VSCode snippets file (TODO do it anyway and merge with the map...)
// Information relevant to the undocumented marketplace.visualstudio.com/_apis endpoints:
// https://github.com/microsoft/vscode/blob/main/src/vs/platform/extensionManagement/common/extensionGalleryService.ts
// Feasibility of marketplace API access encouraged by:
// https://www.powershellgallery.com/packages/BcContainerHelper/1.0.18-preview300/Content/ContainerHandling%5CGet-LatestAlLanguageExtensionUrl.ps1
import fs from 'node:fs/promises'

function cleanExtensions(extensions) {
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
function addLanguagesToMapFromManifest(languageMap, manifest) {
	if ('contributes' in manifest) {
		if ('languages' in manifest.contributes) {
			for (const language of manifest.contributes.languages) {
				if ('extensions' in language) {
					for (const extension of cleanExtensions(language.extensions)) {
						if (!languageMap.has(extension)) {
							languageMap.set(extension, new Set())
						}

						languageMap.get(extension).add(language.id)
					}
				}
			}
		}
	} else {
		console.warn(`Warning: No languages key found in manifest for "${manifest.name}"`)
	}

	return languageMap
}

// Gets extensions from the marketplace
async function getExtensions(
	pageNumber = 1,
	pageSize = 100,
	programmingLanguagesCategoryOnly = true,
) {
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

	const response = await fetch(
		'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
		{
			body: JSON.stringify(requestBody),
			headers: {
				Accept: 'application/json;api-version=7.1-preview.1;excludeUrls=true',
				'Accept-Language': 'en-US,en;q=0.9',
				'Accept-encoding': 'gzip, deflate, br',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		},
	)

	const data = await response.json()

	return {
		extensions: data.results[0].extensions,
		totalCount: data.results[0].resultMetadata[0].metadataItems[0].count,
	}
}

// Gets bundled extensions from VSCode source
async function getProgrammingLanguageIdsFromBundledExtensions(extensionLanguageIds = new Map()) {
	// Get list of bundled extensions from extensions folder
	const response = await fetch('https://api.github.com/repos/microsoft/vscode/contents/extensions')
	const directoryList = await response.json()
	let totalChecked = 0

	const manifestUrls = directoryList.flatMap((value) => {
		if (value.type === 'dir') {
			return [
				`https://raw.githubusercontent.com/microsoft/vscode/main/extensions/${value.name}/package.json`,
			]
		}

		return []
	})

	for (const manifestUrl of manifestUrls) {
		totalChecked += 1
		console.log(`Checking vscode manifest ${totalChecked} / ${manifestUrls.length}: ${manifestUrl}`)
		try {
			const manifestResponse = await fetch(manifestUrl)
			const manifest = await manifestResponse.json()
			extensionLanguageIds = addLanguagesToMapFromManifest(extensionLanguageIds, manifest)
		} catch (error) {
			console.error(`Warning: No manifest at: ${manifestUrl} (Error: ${error})`)
		}
	}

	return extensionLanguageIds
}

async function getLanguageIDsFromExtensionsMarketplace(
	extensionLanguageIds = new Map(),
	programmingLanguagesCategoryOnly = true,
) {
	const pageSize = 100
	const maxResults = Number.MAX_SAFE_INTEGER // Cap results for development
	// const maxResults = 100 // cap results for development

	// Get total count
	const { totalCount } = await getExtensions(1, 1, programmingLanguagesCategoryOnly)
	const totalPages = Math.ceil(Math.min(totalCount, maxResults) / pageSize)

	let totalChecked = 0

	console.log(
		`Found ${totalCount} results to be queried across ${totalPages} requests at ${pageSize} results per page`,
	)

	for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
		const { extensions } = await getExtensions(
			currentPage,
			pageSize,
			programmingLanguagesCategoryOnly,
		)

		for (const extension of extensions) {
			totalChecked += 1

			const manifestUrl = extension?.versions[0]?.files[0]?.source

			if (manifestUrl === undefined) {
				console.error(
					`Error: Issue getting manifest url from extension ${JSON.stringify(extension, undefined, 2)})`,
				)
			} else {
				try {
					console.log(
						`Checking marketplace manifest ${totalChecked} / ${totalCount}: ${manifestUrl}`,
					)
					const response = await fetch(manifestUrl)
					const manifest = await response.json()

					extensionLanguageIds = addLanguagesToMapFromManifest(extensionLanguageIds, manifest)
				} catch (error) {
					console.error(`Error: Issue getting manifest for ${manifestUrl} (Error: ${error})`)
				}
			}
		}
	}

	return extensionLanguageIds
}

async function updateVsCodeLanguageData() {
	let extensionLanguageIds = new Map()

	extensionLanguageIds = await getProgrammingLanguageIdsFromBundledExtensions(extensionLanguageIds)
	extensionLanguageIds = await getLanguageIDsFromExtensionsMarketplace(extensionLanguageIds, false)

	// Convert map set to object for json conversion
	const fileExtensionCount = extensionLanguageIds.size
	let languageIdCount = 0
	const extensionLanguageIdsObject = {}
	for (const [extensionKey, languageIdSet] of extensionLanguageIds.entries()) {
		languageIdCount += languageIdSet.size
		extensionLanguageIdsObject[extensionKey] = [...languageIdSet]
	}

	console.log(`Found ${fileExtensionCount} file extensions and ${languageIdCount} language IDs`)

	// Save to file in data folder
	await fs.writeFile(
		'./data/vscode-language-map.json',
		JSON.stringify(extensionLanguageIdsObject, undefined, 2),
		{
			flag: 'w',
		},
	)
}

await updateVsCodeLanguageData()
