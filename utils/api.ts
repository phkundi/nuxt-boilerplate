export const handleResponseData = async (response: Response) => {
  let responseData;
  const contentType = response.headers.get("content-type");
  if (
    contentType &&
    contentType.includes("application/json") &&
    response.status !== 204
  ) {
    responseData = await response.json();
  } else {
    responseData = null;
  }
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("You need to be logged in to do this.");
    }
    throw new Error(
      responseData.detail ||
        responseData.error ||
        responseData.message ||
        "An error occurred while processing the request."
    );
  }

  return responseData;
};
