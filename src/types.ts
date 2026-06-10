export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface VisualStyle {
  display?: 'block' | 'flex' | 'grid' | 'none' | 'inline-block';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: string;
  alignItems?: string;
  gridTemplateColumns?: string;
  gridGap?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  boxShadow?: string;
  opacity?: string;
  transform?: string;
  transition?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  order?: number;
  flexGrow?: number;
  flexShrink?: number;
  zIndex?: number;
  backdropFilter?: string;
}

export type ElementType = 
  | 'container' 
  | 'text' 
  | 'button' 
  | 'image' 
  | 'input' 
  | 'form' 
  | 'card' 
  | 'icon' 
  | 'heading' 
  | 'grid-container'
  | 'component-instance';

export interface WorkflowBlock {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'variable';
  name: string; // e.g. "On Click", "Call REST API", "If Condition", "Set Local Var"
  actionType?: 'setProperty' | 'navigate' | 'fetchApi' | 'customCode' | 'showHide';
  targetElementId?: string;
  propertyKey?: string;
  propertyValue?: string;
  fetchUrl?: string;
  fetchMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fetchHeaders?: string; // JSON
  fetchBody?: string;
  conditionExpression?: string;
  nextBlockId?: string;
  parentId?: string;
  jsCode?: string;
}

export interface AetherElement {
  id: string;
  type: ElementType;
  name: string;
  styles: {
    mobile?: VisualStyle;
    tablet?: VisualStyle;
    desktop?: VisualStyle;
  };
  attributes: {
    idAttr?: string;
    classAttr?: string;
    placeholder?: string;
    src?: string;
    alt?: string;
    href?: string;
    textContent?: string;
    iconName?: string;
    [key: string]: string | undefined;
  };
  children: AetherElement[];
  componentId?: string; // if type === 'component-instance'
  workflowIds?: string[]; // linked logic workflows
}

export interface CustomComponent {
  id: string;
  name: string;
  rootElement: AetherElement;
  description?: string;
}

export interface DatabaseRelation {
  id: string;
  name: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'Relation';
  isId: boolean;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  columns: DatabaseColumn[];
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'font' | 'css' | 'js';
  size: string;
  url: string;
}

export interface AetherProject {
  id: string;
  name: string;
  rootNode: AetherElement;
  pages?: {
    id: string;
    name: string;
    rootNode: AetherElement;
  }[];
  customComponents: CustomComponent[];
  databaseSchema: {
    tables: DatabaseTable[];
    relations: DatabaseRelation[];
  };
  workflows: WorkflowBlock[];
  assets: AssetItem[];
  plugins: string[]; // name of installed plugins
}
