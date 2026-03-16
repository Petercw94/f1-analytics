/**
 * Client for interacting with the public F1 API: OpenF1
 */

export type OpenF1ClientConfig = {
  baseUrl: string;
  apiVersion: string;
  maxRetryAttempts: number;
  timeoutMs: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
};

export type OpenF1RequestOptions = {
  path: string;
  query?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  method?: "GET";
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type RetryLogEvent = {
  url: string;
  attempt: number;
  status: number;
  waitMs: number;
};

export type OpenF1ClientDeps = {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
  onRetry?: (event: RetryLogEvent) => void;
};

export type OpenF1Error = {
  kind: "http" | "timeout" | "network" | "parse";
  message: string;
  url: string;
  attempt: number;
  retryable: boolean;
  status?: number;
  cause?: unknown;
};

export const DEFAULT_OPENF1_CONFIG: OpenF1ClientConfig = {
  baseUrl: "https://api.openf1.org",
  apiVersion: "v1",
  maxRetryAttempts: 2,
  timeoutMs: 4000,
  backoffBaseMs: 250,
  backoffMaxMs: 4000,
};

export const DEFAULT_OPENF1_DEPS: OpenF1ClientDeps = {
  fetch: globalThis.fetch,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: () => Math.random(),
};

const RETRY_STATUSES = new Set([
  429,
  500,
  502,
  503,
  504
]);

export type GetMeetingsParams = {
  year?: number;
  country_name?: string;
};

export type GetSessionsParams = {
  meeting_key?: number | "latest";
  year?: number;
  session_name?: string;
  session_type?: string;
};

export type GetDriversParams = {
  session_key: number | "latest";
  driver_number?: number;
};

export type GetLapsParams = {
  session_key: number | "latest";
  driver_number?: number;
  lap_number?: number;
};

export function buildOpenF1Url(
  _baseUrl: string,
  _apiVersion: string,
  _path: string,
  _query: OpenF1RequestOptions["query"] = {},
): URL {
  let base = _baseUrl.replace(/\/+$/, "") + "/";
  let version = _apiVersion.replace(/^\/+|\/+$/, "");
  let path = _path.replace(/^\/+/, "");
  let fullPath = [version, path].filter(Boolean).join("/");
  let url = new URL(fullPath, base);
  return _build_url_params(url, _query);
}

/**
 * Internal function for adding all the provided parameters to the URL object
 *
 * If a url parameters contains an array, the key should be added and then appended to.
 *
 * e.g.:
 *
 * ```
 * { test: [4,81]}
 * ```
 * Should result in: /?test=4&test=81
 *
 * @param url : The URL object to add the parameters to
 * @param _params : An object of parameters to add
 * @returns URL with added searchParameters
 */
function _build_url_params(url: URL, _params: Record<string, any>): URL {
  for (const [key, value] of Object.entries(_params)) {

    if (value === undefined) {
      continue;
    } else if (value instanceof Array) {

      for (const entry of value) {
        url.searchParams.append(key, entry);
      }
    } else {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

/**
 * Determine if the returned status is retryable or not
 * @param _status : the response status code
 * @returns : a boolean indicating whether in the input status is retryable or not
 */
export function isRetryableStatus(_status: number): boolean {
  if (RETRY_STATUSES.has(_status)) {
    return true;
  }

  return false;
}

/**
 * Calculate the exponential backoff limited by a min and max determined by the client.
 *
 * @param _attempt: the number retry attempt
 * @param _config: The provided requests config that contains min and max backoff limits
 * @returns number: the number of seconds to wait before the next retry
 */
export function computeBackoffMs(
  _attempt: number,
  _config: Pick<OpenF1ClientConfig, "backoffBaseMs" | "backoffMaxMs">,
): number {
  const exp = 2 ** _attempt;
  const backOff = exp * 100;
  if (backOff < _config.backoffBaseMs) {
    return _config.backoffBaseMs;
  } else if (backOff > _config.backoffMaxMs) {
    return _config.backoffMaxMs;
  }

  return backOff;

}

/**
 * Parse the retry-after header to determine retry limits
 *
 * @param _headers: an instance of the Headers object with the get method
 * @returns: the number of seconds converted to milliseconds or null
 */
export function parseRetryAfterMs(_headers: Pick<Headers, "get">): number | null {
  const retryMs = _headers.get("retry-after");
  if (typeof retryMs === 'number' && retryMs !== null) {
    return retryMs * 1000;
  }
  if (typeof retryMs === 'string' && retryMs != null) {
    return Number.isNaN(+retryMs) ? null : +retryMs * 1000;
  }
  return null;
}

// TODO : implement a normalizer for errors
export function normalizeOpenF1Error(input: OpenF1Error): OpenF1Error {
  return input;
}

export async function requestJson<T>(
  _config: OpenF1ClientConfig,
  _deps: OpenF1ClientDeps,
  _req: OpenF1RequestOptions,
): Promise<T> {


  const url = buildOpenF1Url(_config.baseUrl, _config.apiVersion, _req.path, _req.query)

  let retryCount = 0;

  let resp: Response;

  while (true) {
    resp = await _deps.fetch(
      url,
      {
        method: _req.method,
        headers: _req.headers,
      }
    )
    let status = resp.status

    if (resp.ok) {
      const data = (await resp.json()) as T;
      return data;
    }

    if (RETRY_STATUSES.has(status) && retryCount < _config.maxRetryAttempts) {

      const retryAfter = parseRetryAfterMs(resp.headers);
      const backOffMs = computeBackoffMs(++retryCount, _config);

      let sleepTime = retryAfter ? retryAfter : backOffMs;
      const jitter = 100 * _deps.random();
      sleepTime += jitter;

      _deps.onRetry?.({ url: url.toString(), attempt: retryCount, status: status, waitMs: sleepTime });
      await _deps.sleep(sleepTime);



    } else {
      throw normalizeOpenF1Error({
        kind: "http",
        message: `Request failed with status ${resp.status}`,
        url: url.toString(),
        attempt: 0,
        retryable: isRetryableStatus(resp.status),
        status: resp.status,
      });
    }
  };




}

export function createOpenF1Client(
  _configOverrides: Partial<OpenF1ClientConfig> = {},
  _depsOverrides: Partial<OpenF1ClientDeps> = {},
) {
  const _config = { ...DEFAULT_OPENF1_CONFIG, ..._configOverrides };
  const _deps = { ...DEFAULT_OPENF1_DEPS, ..._depsOverrides };

  return {
    getMeetings: async (_params: GetMeetingsParams = {}): Promise<unknown[]> => {
      const _req: OpenF1RequestOptions = {
        path: "/meetings",
        query: _params,
        timeoutMs: 1000,
      }
      return requestJson(_config, _deps, _req);
    },
    getSessions: async (_params: GetSessionsParams = {}): Promise<unknown[]> => {
      const _req: OpenF1RequestOptions = {
        path: "/sessions",
        query: _params,
        timeoutMs: 1000,
      }
      return requestJson(_config, _deps, _req);
    },
    getDrivers: async (_params: GetDriversParams): Promise<unknown[]> => {
      const _req: OpenF1RequestOptions = {
        path: "/drivers",
        query: _params,
        timeoutMs: 1000,
      }
      return requestJson(_config, _deps, _req);
    },
    getLaps: async (_params: GetLapsParams): Promise<unknown[]> => {
      const _req: OpenF1RequestOptions = {
        path: "/drivers",
        query: _params,
        timeoutMs: 1000,
      }
      return requestJson(_config, _deps, _req);
    },
  };
}
