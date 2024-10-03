import axios from "axios";

export const postRequest = async (
  url: string,
  token?: string,
  body?: BodyInit
) => {
  try {
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { data } = error.response;
      const message = data?.error ? data.error : data;
      return { error: true, message };
    } else {
      return { error: true, message: (error as Error).message };
    }
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
    if (axios.isAxiosError(error) && error.response) {
      const { data } = error.response;
      const message = data?.error ? data.error : data;
      return { error: true, message };
    } else {
      return { error: true, message: (error as Error).message };
    }
  }
};

export const putRequest = async (
  url: string,
  token: string,
  body: BodyInit,
) => {
  try {
    const response = await axios.put(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log(error)
    if (axios.isAxiosError(error) && error.response) {
      const { data } = error.response;
      const message = data?.error ? data.error : data;
      return { error: true, message };
    } else {
      return { error: true, message: (error as Error).message };
    }
  }
};

export const baseUrl = 'https://chat-forum-api-db3bf0ece27b.herokuapp.com'


