declare module 'react-tag-input' {
  import { Component } from 'react';

  export interface Tag {
    id: string;
    text: string;
    className?: string;
  }

  export interface ReactTagsProps {
    tags: Tag[];
    suggestions?: Tag[];
    delimiters?: number[];
    placeholder?: string;
    labelField?: string;
    handleAddition: (tag: Tag) => void;
    handleDelete: (index: number) => void;
    handleDrag?: (tag: Tag, currPos: number, newPos: number) => void;
    handleFilterSuggestions?: (textInputValue: string, possibleSuggestionsArray: Tag[]) => Tag[];
    handleTagClick?: (index: number) => void;
    autofocus?: boolean;
    allowDeleteFromEmptyInput?: boolean;
    handleInputChange?: (value: string) => void;
    handleInputFocus?: () => void;
    handleInputBlur?: () => void;
    minQueryLength?: number;
    removeComponent?: () => React.ReactNode;
    autocomplete?: boolean | number;
    readOnly?: boolean;
    name?: string;
    id?: string;
    maxLength?: number;
    inline?: boolean;
    inputFieldPosition?: 'inline' | 'top' | 'bottom';
    allowUnique?: boolean;
    allowDragDrop?: boolean;
    renderSuggestion?: (suggestion: Tag) => React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    allowAdditionFromPaste?: boolean;
    editable?: boolean;
    onTagUpdate?: (index: number, newTag: Tag) => void;
    clearAll?: boolean;
    onClearAll?: () => void;
    maxTags?: number;
    classNames?: {
      tags?: string;
      tagInput?: string;
      tagInputField?: string;
      selected?: string;
      tag?: string;
      remove?: string;
      suggestions?: string;
      activeSuggestion?: string;
      editTagInput?: string;
      editTagInputField?: string;
      clearAll?: string;
    };
  }

  export class WithContext extends Component<ReactTagsProps> {}
  export class WithOutContext extends Component<ReactTagsProps> {}
  
  export const KEYS: {
    TAB: number;
    SPACE: number;
    COMMA: number;
    ENTER: number;
  };
}

