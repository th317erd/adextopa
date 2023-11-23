/* eslint-disable no-magic-numbers */

import * as Util          from 'node:util';
import * as Path          from 'node:path';
import * as FileSystem    from 'node:fs';
import { fileURLToPath }  from 'node:url';
import * as jsDiff        from 'diff';
import colors             from 'colors/safe.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = Path.dirname(__filename);

const MAX_FILE_NAME_LENGTH = 100;

function calcDiff(fileName, c1, c2) {
  return jsDiff.createPatch(fileName, c1 || '', c2 || '').replace(/.*/g, function(m) {
    if (!m)
      return m;

    let c = m.charAt(0);
    let out = m;

    if (c === '-')
      return colors.red(out);
    else if (c === '+')
      return colors.green(out);
    else
      return out;
  });
}

// function showDiff(fileName, c1, c2) {
//   console.log(calcDiff(fileName, c1, c2));
// }

const TYPE_TEST = /^'?\$type'?:/;
const OBJ_TEST  = /^'?[^:']+'?:\s+[[{]/;

const INSPECT_OPTIONS = {
  depth:            Infinity,
  colors:           false,
  maxArrayLength:   Infinity,
  maxStringLength:  Infinity,
  breakLength:      Infinity,
  compact:          false,
  customInspect:    true,
  sorted:           (_a, _b) => {
    let a     = _a.replace(/'\$type':/, '$type:');
    let b     = _b.replace(/'\$type':/, '$type:');
    let aObj  = +OBJ_TEST.test(a);
    let bObj  = +OBJ_TEST.test(b);
    let aType = +!TYPE_TEST.test(a);
    let bType = +!TYPE_TEST.test(b);

    a = `${aType}:${(!aType) ? 0 : aObj}:${a}`.padEnd(100, '0');
    b = `${bType}:${(!bType) ? 0 : bObj}:${b}`.padEnd(100, '0');

    if (a === b)
      return 0;

    return (a < b) ? -1 : 1;
  },
  getters:          false,
  numericSeparator: false,
};

function isPlainObject(value) {
  if (!value)
    return false;

  if (typeof value !== 'object')
    return false;

  if (value.constructor === Object || value.constructor == null)
    return true;

  return false;
}

function serialize(value) {
  const typeOf = (value) => {
    if (value === undefined)
      return 'undefined';

    if (value === null)
      return 'null';

    let type = typeof value;
    if (type !== 'object')
      return type;

    return ((value.constructor && value.constructor.name) || 'Object');
  };

  const mutate = (value) => {
    if (!value)
      return value;

    let thisType = typeof value;
    if (thisType !== 'object')
      return value;

    if (typeof value.valueOf === 'function' && typeof value.valueOf() !== 'object')
      return value;

    if (Array.isArray(value))
      return value.map(mutate);

    if (value instanceof Error) {
      let errorObj = {
        $type:    value.constructor.name || 'Error',
        message:  value.message,
      };

      Object.keys(Object.getOwnPropertyDescriptors(value)).forEach((key) => {
        if (key === 'stack' || key === 'parserContext')
          return;

        errorObj[key] = value[key];
      });

      return errorObj;
    }

    if (!isPlainObject(value))
      return value;

    let keys    = Object.keys(value);
    let newObj  = {};

    for (let i = 0, il = keys.length; i < il; i++) {
      let key = keys[i];
      let thisValue = value[key];

      newObj[key] = mutate(thisValue);
    }

    return newObj;
  };

  return Util.inspect({
    $type:  typeOf(value),
    value:  mutate(value),
  }, INSPECT_OPTIONS);
}

const specFileCache = {};
const callCountCache = {};

function getSnapshotNameAndPath() {
  const getFileName = (stackLine) => {
    let fileName;

    stackLine.replace(/\(?([^(]+):\d+:\d+\)?$/, (_, str) => {
      fileName = str;
    });

    if ((/^file:\/\//i).test(fileName))
      fileName = fileURLToPath(fileName);

    return fileName;
  };

  const getLineNumber = (stackLine) => {
    let number;

    stackLine.replace(/(\d+):\d+\)?$/, (_, numStr) => {
      number = parseInt(numStr, 10);
    });

    return number;
  };

  const getBacktraceFile = () => {
    const matchesPatterns = (patterns, fileName) => {
      for (let i = 0, il = patterns.length; i < il; i++) {
        let pattern = patterns[i];
        if (pattern.test(fileName))
          return true;
      }

      return false;
    };

    let specFilePatterns  = [ /-spec\.js/ ];
    let stack             = (new Error()).stack.split(/\s+at\s+|\s+\(/g).slice(1).map((part) => part.trim());
    let file;

    for (let i = 0, il = stack.length; i < il; i++) {
      let stackLine = stack[i];
      let fileName  = getFileName(stackLine);
      if (!matchesPatterns(specFilePatterns, fileName))
        continue;

      let lineNumber = getLineNumber(stackLine);

      if (!file) {
        file = {
          lineNumbers: [ lineNumber ],
          fileName,
        };
      } else {
        file.lineNumbers.push(lineNumber);
      }
    }

    return file;
  };

  const getSpecFileStructure = (fileName) => {
    if (specFileCache[fileName])
      return specFileCache[fileName];

    let contents = FileSystem.readFileSync(fileName, 'utf8');
    let lines = contents.split(/\n/g);

    lines = lines.map((line, lineIndex) => {
      let specName;
      let indentAmount;
      let type;

      line.replace(/([\s\t]*)(f?describe|f?it)\s*\(\s*(['"])((?:\\.|.)*?)\3/, (m, indent, _type, q, name) => {
        type = _type;
        specName = name.replace(/\\(.)/g, '$1');
        indentAmount = indent.replace(/\t/g, '  ').length;
      });

      if (!specName)
        return;

      return { type, specName, indentAmount, lineNumber: lineIndex + 1 };
    }).filter(Boolean);

    let nodes = [];
    let currentChildren = nodes;
    let previousNode;
    let parent = null;

    for (let i = 0, il = lines.length; i < il; i++) {
      let line = lines[i];
      let { type, specName, indentAmount, lineNumber } = line;

      if (previousNode) {
        if (previousNode.indentAmount < indentAmount) {
          parent = previousNode;
          currentChildren = previousNode.children;
        } else if (previousNode.indentAmount > indentAmount) {
          parent = previousNode.parent;
          while (parent && parent.indentAmount >= indentAmount)
            parent = parent.parent;

          currentChildren = (parent) ? parent.children : nodes;
        }
      }

      let node = { type, parent, indentAmount, name: specName, lineNumber, children: [] };
      currentChildren.push(node);

      previousNode = node;
    }

    specFileCache[fileName] = nodes;

    return nodes;
  };

  const findCorrectNode = (nodes, lineNumber) => {
    const flattenNodes = (nodes, finalNodes) => {
      for (let i = 0, il = nodes.length; i < il; i++) {
        let node = nodes[i];
        if (!node)
          continue;

        let isIT = (node.type === 'it' || node.type === 'fit');
        if (isIT)
          finalNodes.push(node);

        if (!node.children || node.children.length === 0)
          continue;

        flattenNodes(node.children, finalNodes);
      }

      return finalNodes;
    };

    let flattenedNodes = flattenNodes(nodes, []).sort((a, b) => {
      let x = a.lineNumber;
      let y = b.lineNumber;

      if (x === y)
        return 0;

      return (x < y) ? -1 : 1;
    }).reverse();

    let nodeIndex = flattenedNodes.findIndex((node) => (node.lineNumber < lineNumber));
    if (nodeIndex < 0)
      return flattenedNodes[flattenedNodes.length - 1];

    return flattenedNodes[nodeIndex];
  };

  const getLastNode = (nodes) => {
    if (!nodes.length)
      return;

    let lastNode = nodes[nodes.length - 1];
    if (lastNode.children.length > 0)
      return getLastNode(lastNode.children);

    return lastNode;
  };

  const getNodePath = (_node) => {
    if (!_node)
      return;

    let node = _node;
    let path = [ node.name ];

    while (node && node.parent) {
      node = node.parent;
      path.push(node.name);
    }

    return path.reverse().join('/');
  };

  const getCorrectNodePath = (nodes, lineNumbers) => {
    let lineNumber = lineNumbers.sort()[lineNumbers.length - 1];
    let node = findCorrectNode(nodes, lineNumber);
    if (!node)
      node = getLastNode(nodes);

    let nodePath  = getNodePath(node);
    let callCount = callCountCache[nodePath];
    if (!callCount)
      callCount = 0;

    callCount++;
    callCountCache[nodePath] = callCount;

    nodePath = nodePath.replace(/[^\w/]+/g, '_').replace(/\//g, '-');
    if (nodePath.length > MAX_FILE_NAME_LENGTH) {
      nodePath = nodePath.substring(0, MAX_FILE_NAME_LENGTH);
      nodePath = nodePath.replace(/^[^0-9a-zA-Z]+/, '').replace(/[^0-9a-zA-Z]+$/, '');
    }

    // eslint-disable-next-line no-magic-numbers
    return (`${nodePath}-${('' + callCount).padStart(3, '0')}.snapshot`);
  };

  const getSnapshotDetails = () => {
    let { fileName, lineNumbers } = getBacktraceFile();
    let nodes = getSpecFileStructure(fileName);
    let name  = getCorrectNodePath(nodes, lineNumbers);

    return { path: Path.dirname(fileName), name };
  };

  let structure = getSnapshotDetails();
  return structure;
}

export function matchesSnapshot(value) {
  let { name, path }  = getSnapshotNameAndPath();
  let snapshotPath    = Path.join(path, '__snapshots__');
  let fullPath        = Path.join(snapshotPath, name);

  try {
    FileSystem.mkdirSync(snapshotPath);
  } catch (error) {
    if (error.code !== 'EEXIST')
      throw error;
  }

  let updateSnapshots = (process.argv.indexOf('--update-snapshots') >= 0);

  let serializedValue = serialize(value);
  if (!FileSystem.existsSync(fullPath))
    FileSystem.writeFileSync(fullPath, serializedValue, 'utf8');

  let storedValue = FileSystem.readFileSync(fullPath, 'utf8');
  if (storedValue !== serializedValue) {
    if (updateSnapshots)
      FileSystem.writeFileSync(fullPath, serializedValue, 'utf8');
    else
      return calcDiff(fullPath, storedValue, serializedValue);
  }
}
