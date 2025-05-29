// Strict URL validation using a refined regex
export const isValidURL = (url: string) => {
  const pattern = new RegExp(
    "^(https?://)([a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*(:[0-9]+)?)(/.*)?$"
  );
  return pattern.test(url);
};
