import { fetchContent, hydrateContent } from './cms.js?v=2';

fetchContent('home').then(hydrateContent);
