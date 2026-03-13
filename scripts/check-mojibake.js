import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['ui', 'engine', 'docs'];
const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.txt',
  '.html',
  '.css',
  '.toml',
  '.yml',
  '.yaml',
]);
const IGNORED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
]);

const RULES = [
  {
    id: 'replacement-char',
    description: 'replacement character (U+FFFD)',
    test: (line) => line.includes('\uFFFD'),
  },
  {
    id: 'suspicious-mojibake-cluster',
    description: 'suspicious mojibake cluster',
    // Common UTF-8 Korean text shown through the wrong code page.
    test: (line) => /[諛붾댁룄쓣쒖⑸湲寃媛吏몃듭쟾섎뺣옱꾨룷]{3,}/.test(line),
  },
];

function isIgnoredPath(filePath) {
  return filePath
    .split(path.sep)
    .some((segment) => IGNORED_DIR_NAMES.has(segment));
}

function isTargetFile(filePath) {
  if (isIgnoredPath(filePath)) return false;
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function collectFiles(startDir) {
  const absoluteDir = path.join(ROOT_DIR, startDir);
  if (!fs.existsSync(absoluteDir)) return [];

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const absolutePath = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      if (!isIgnoredPath(absolutePath)) {
        files.push(...collectFiles(path.relative(ROOT_DIR, absolutePath)));
      }
      return;
    }

    if (entry.isFile() && isTargetFile(absolutePath)) {
      files.push(absolutePath);
    }
  });

  return files;
}

function findIssuesInFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const issues = [];

  lines.forEach((line, index) => {
    RULES.forEach((rule) => {
      if (!rule.test(line)) return;
      issues.push({
        filePath,
        lineNumber: index + 1,
        ruleId: rule.id,
        description: rule.description,
        line,
      });
    });
  });

  return issues;
}

function formatIssue(issue) {
  const relativePath = path.relative(ROOT_DIR, issue.filePath).replaceAll('\\', '/');
  return `${relativePath}:${issue.lineNumber} [${issue.ruleId}] ${issue.description}\n  ${issue.line}`;
}

function main() {
  const files = TARGET_DIRS.flatMap((dir) => collectFiles(dir));
  const issues = files.flatMap((filePath) => findIssuesInFile(filePath));

  if (issues.length === 0) {
    console.log(`No mojibake markers found in ${files.length} files.`);
    return;
  }

  console.error(`Found ${issues.length} potential mojibake issue(s):`);
  issues.forEach((issue) => {
    console.error(formatIssue(issue));
  });
  process.exitCode = 1;
}

main();
