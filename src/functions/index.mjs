import setupFirebase from './firebase.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import camelcase from 'camelcase';

setupFirebase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = glob.sync('./**/*.f.mjs', {
  cwd: __dirname,
  ignore: './node_modules/**',
});

const functionExports = {};
for (const file of files) {
  const functionName = camelcase(
    file.replace('./', '').split('.f.mjs').join('').split('/')
  );

  if (import.meta.env?.DEV) {
    console.log(functionName);
  }

  const module = await import(path.resolve(__dirname, file));

  functionExports[functionName] = module?.default || module;
}

export const functions = functionExports;
