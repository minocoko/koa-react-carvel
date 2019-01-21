import { ServerStyleSheet } from 'styled-components';

export default function (element) {
  const sheet = new ServerStyleSheet();
  return sheet.collectStyles(element);
}
