<a href="https://travis-ci.org/Xotic750/replace-x"
title="Travis status">
<img src="https://travis-ci.org/Xotic750/replace-x.svg?branch=master"
alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/replace-x"
title="Dependency status">
<img src="https://david-dm.org/Xotic750/replace-x.svg"
alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/replace-x#info=devDependencies"
title="devDependency status">
<img src="https://david-dm.org/Xotic750/replace-x/dev-status.svg"
alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/replace-x" title="npm version">
<img src="https://badge.fury.io/js/replace-x.svg"
alt="npm version" height="18">
</a>

# replace

`replace-x` is a command line utility for performing in place search-and-replace on files. It's similar to sed but there are a few differences:

- Modifies files when matches are found
- Recursive search on directories with -r
- Uses [JavaScript syntax](https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions#Using_Simple_Patterns) for regular expressions and [replacement strings](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter).
- Uses [XRegExp](http://xregexp.com/) to provide augmented (and extensible) JavaScript regular expressions.

# Install

With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

    npm install replace-x -g

You can now use `replace-x` and `search-x` from the command line.

## Examples

Replace all occurrences of "foo" with "bar" in files in the current directory:

```
replace-x 'foo' 'bar' *
```

Replace in all files in a recursive search of the current directory:

```
replace-x 'foo' 'bar' . -r
```

Replace-x only in test/file1.js and test/file2.js:

```
replace-x 'foo' 'bar' test/file1.js test/file2.js
```

Replace-x all word pairs with "\_" in middle with a "-":

```
replace-x '(\w+)_(\w+)' '$1-$2' *
```

Replace only in files with names matching \*.js:

```
replace-x 'foo' 'bar' . -r --include="*.js"
```

Don't replace in files with names matching _.min.js and _.py:

```
replace-x 'foo' 'bar' . -r --exclude="*.min.js,*.py"
```

Preview the replacements without modifying any files:

```
replace-x 'foo' 'bar' . -r --preview
```

See all the options:

```
replace-x -h
```

## Search

There's also a `search-x` command. It's like `grep`, but with `replace-x`'s syntax.

```
search-x "setTimeout" . -r
```

## Programmatic Usage

You can use replace from your JS program:

```javascript
import replace from 'replace-x';

replace({
  regex: 'foo',
  replacement: 'bar',
  paths: ['.'],
  recursive: true,
  silent: true,
});
```

## More Details

### Excludes

By default, `replace-x` and `search-x` will exclude files (binaries, images, etc) that match patterns in the `"defaultignore"` located in this directory.

### On huge directories

If `replace-x` is taking too long on a large directory, try turning on the quiet flag with `-q`, only including the necessary file types with `--include` or limiting the lines shown in a preview with `-n`.

## Limitations

### Line length

By default, `replace-x` works on files with lines of 400 characters or less. If you need to work on long lines, gnu `sed` supports unlimited line length.

### Symbolic links

By default, `replace-x` does not traverse symbolic links for files in directories.

## What it looks like

![replace-x](http://i.imgur.com/qmJjS.png)
