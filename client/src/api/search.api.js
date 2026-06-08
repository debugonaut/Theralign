import axiosInstance from './axiosInstance';

/**
 * Public search suggestions autocomplete query endpoint.
 * @param {string} query - The letters typed by the user (min 2 chars).
 */
export const getSearchSuggestions = (query) =>
  axiosInstance.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
