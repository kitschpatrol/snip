# snipster
**~ snippets for hipsters ~**

snipster is a snippets manager that removes the complexity of managing snippets across your different text editors. it also allows you to write and arrange snippets *by file* in a centralized directory organized however you'd like, rather than by hand-editing a 1000-line json or cson file.

### example
**before (vscode):**
**javascript.json**
```
"For Loop": {
  "prefix": "for",
  "body": [
    "for (var ${index} = 0; ${index} < ${array}.length; ${index}++) {",
    "\tvar ${element} = ${array}[${index}];",
    "\t$0",
    "}"
  ],
  "description": "For Loop"
},
... all of your other snippets ...
```

**after (snipster):**
**for.js**
```
for (var ${index} = 0; ${index} < ${array}.length; ${index}++) {
  var ${element} = ${array}[${index}];
  $0
}
```

## how it works
write snippets as you would normally write code - don't worry about shoving it into a json or cson object, quoting every single line, escaping tabs and new lines, indenting, etc. leave all of that complexity for snipster.

1. the name of your snippet file is the prefix you use to call it.
2. the file extension of your snippet file is the language scope under which the snippet can be used. get fancy with multiple scopes like 'html+md+txt' to use the snippet is several scopes. use shortcut extensions like 'all' or 'style' to use the snippet in all file types or all similar style file types (css, less, scss).
3. the content of the file is the snippet body, exactly what will appear when you type the prefix and tab. use placeholders ($1{placeholder}) just like normal.

## install & set-up
```
yarn global add snipster
-- or --
npm install -g snipster

snipster init
```


## api
```
snipster init
```
get set up with snipster by telling it where your snippets are and which text editors you use.

```
snipster publish
```
publish all of the snippets in your directory to your text editors (currently vscode and atom are supported). after running this, you should be able to use all of your snippets across either editor.

```
snipster list
```
coming soon

```
snipster add
```
coming soon

```
snipster help
```
coming soon

## todo
- warn user that they will lose snippets from their editor before publishing
- snipster add - add a snippet to your directory from the command line. copypaste the contents in or supply a gist url or github repo for bulk adding
- snipster publish - add options to publish only to certain editors
- snipster list - list all snippets in your directory
- snipster init - move pre-existing snippets from editors into new or provided snippets directory
- snipster help - get information about how to use snipster
- less naive assumptions about editor installations, e.g. account for users who use homebrew to install editors
- test that snipster works on pc
- write automated tests
- add support for sublime
- add support for brackets
- add support for textmate


## donate
if you find value in snipster please feel free to [buy me a coffee](https://www.paypal.me/jhanstra/4) :)