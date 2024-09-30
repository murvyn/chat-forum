import axios from "axios";

export const baseUrl = `${import.meta.env.VITE_BASEURL}/api`;

const handleRequestError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    const { data } = error.response;
    const message = data?.error ? data.error : data;
    return { error: true, message };
  }
  return { error: true, message: (error as Error).message };
};

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const postRequest = async (
  url: string,
  token: string,
  body?: BodyInit
) => {
  try {
    const response = await axios.post(url, body, {
      headers: getHeaders(token),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};

export const putRequest = async (
  url: string,
  token: string,
  body: BodyInit
) => {
  try {
    const response = await axios.put(url, body, {
      headers: getHeaders(token),
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};

export const getRequest = async (url: string, token: string) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};
