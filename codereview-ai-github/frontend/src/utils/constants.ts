import type { Language } from '@/types';

export const TOKEN_KEY = 'cr_token';
export const DRAFT_KEY = 'cr_draft';

export interface LanguageOption {
  value: Language;
  label: string;
  monaco: string;
  sample: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    value: 'javascript',
    label: 'JavaScript',
    monaco: 'javascript',
    sample: `function sum(arr) {\n  let total = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}`,
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    monaco: 'typescript',
    sample: `function greet(name: string) {\n  return "Hello, " + name;\n}`,
  },
  {
    value: 'python',
    label: 'Python',
    monaco: 'python',
    sample: `def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
  },
  {
    value: 'java',
    label: 'Java',
    monaco: 'java',
    sample: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}`,
  },
  {
    value: 'cpp',
    label: 'C++',
    monaco: 'cpp',
    sample: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello" << endl;\n    return 0;\n}`,
  },
  {
    value: 'go',
    label: 'Go',
    monaco: 'go',
    sample: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello")\n}`,
  },
];

export const getLanguage = (value: string): LanguageOption =>
  LANGUAGES.find((l) => l.value === value) ?? LANGUAGES[0];
