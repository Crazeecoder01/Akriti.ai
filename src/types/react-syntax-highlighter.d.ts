declare module 'react-syntax-highlighter' {
  import { Component } from 'react';

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: any;
    showLineNumbers?: boolean;
    children?: string;
    [key: string]: any;
  }

  export class Prism extends Component<SyntaxHighlighterProps> { }
  export default class SyntaxHighlighter extends Component<SyntaxHighlighterProps> { }
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
}
