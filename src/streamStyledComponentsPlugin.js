import { ServerStyleSheet } from 'styled-components';

export default function (renderToNodeStream, element) {
  const sheet = new ServerStyleSheet();
  return sheet.interleaveWithNodeStream(renderToNodeStream(element));
}
