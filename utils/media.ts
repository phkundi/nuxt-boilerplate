export const formatMediaUrl = (url: string): string => {
  const backendRoot = useRuntimeConfig().public.backendUrl as string;

  try {
    if (!url.includes(backendRoot)) {
      url = `${backendRoot}${url}`;
    }
  } catch {
    console.error("Error formatting media url");
  }
  return url;
};
