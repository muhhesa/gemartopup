export const INDOFLAZZ_API_URL = "https://a-api.indoflazz.com/api";
export const INDOFLAZZ_API_KEY = process.env.INDOFLAZZ_API_KEY || "";

export interface IndoflazzResponse<T> {
  status: boolean;
  msg: string;
  data: T;
}

export const getIndoflazzServices = async () => {
  const url = `${INDOFLAZZ_API_URL}/service`;
  const body = new URLSearchParams({
    api_key: INDOFLAZZ_API_KEY,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
};

export const createIndoflazzOrder = async (
  serviceId: string,
  target: string,
  kontak: string,
  idtrx: string
) => {
  const url = `${INDOFLAZZ_API_URL}/order`;
  const body = new URLSearchParams({
    api_key: INDOFLAZZ_API_KEY,
    service_id: serviceId,
    target: target,
    kontak: kontak,
    idtrx: idtrx,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
};

export const checkIndoflazzStatus = async (orderId: string) => {
  const url = `${INDOFLAZZ_API_URL}/status`;
  const body = new URLSearchParams({
    api_key: INDOFLAZZ_API_KEY,
    action: "status",
    order_id: orderId,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
};

export const getIndoflazzSaldo = async () => {
  const url = `${INDOFLAZZ_API_URL}/saldo`;
  const body = new URLSearchParams({
    api_key: INDOFLAZZ_API_KEY,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return response.json();
};
