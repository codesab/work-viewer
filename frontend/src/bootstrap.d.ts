declare module "./bootstrap" {
  const mount: (el: Element, options: any) => () => void;
  export default mount;
}
