import { createBrowserHistory } from 'history';

export const basename = process.env.PUBLIC_PATH;
const history = createBrowserHistory({ basename });

export default history;
export function navigateTo(path) {
  history.push(`/${process.env.CONTEXT_PATH}${path}`);
}
