const API_BASE = "/api"

function getUserToken() {
  return localStorage.getItem(
    "anzen_user_token"
  )
}

async function request(
  endpoint,
  options = {}
) {
  const token =
    getUserToken()

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  )

  const data =
    await response
      .json()
      .catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Request failed."
    )
  }

  return data
}


/* --------------------------------------------------
   GEOCODING
-------------------------------------------------- */

export async function searchLocations(
  query
) {
  const data =
    await request(
      `/geocode?q=${encodeURIComponent(
        query
      )}`
    )

  return data.results
}


/* --------------------------------------------------
   ROUTING
-------------------------------------------------- */

export async function analyzeRoutes(
  source,
  destination
) {
  const data =
    await request(
      "/routes/analyze",
      {
        method: "POST",

        body: JSON.stringify({
          source,
          destination,
        }),
      }
    )

  return data.routes
}


/* --------------------------------------------------
   HAZARDS
-------------------------------------------------- */

export async function getHazards() {
  const data =
    await request(
      "/hazards"
    )

  return data.hazards
}

/* --------------------------------------------------
   OFFICIAL CRIME DATA
-------------------------------------------------- */

export async function getOfficialCrimeAreas(
  filters = {}
) {
  const params =
    new URLSearchParams()

  if (filters.year) {
    params.set(
      "year",
      filters.year
    )
  }

  if (filters.category) {
    params.set(
      "category",
      filters.category
    )
  }

  if (filters.state) {
    params.set(
      "state",
      filters.state
    )
  }

  if (filters.level) {
    params.set(
      "level",
      filters.level
    )
  }

  const queryString =
    params.toString()

  const endpoint =
    queryString
      ? `/official-crime?${queryString}`
      : "/official-crime"

  return request(endpoint)
}

/* --------------------------------------------------
   REPORTS
-------------------------------------------------- */

export async function submitReport(
  report
) {
  const data =
    await request(
      "/reports",
      {
        method: "POST",

        body: JSON.stringify(
          report
        ),
      }
    )

  return data.report
}


export async function getMyReports() {
  const data =
    await request("/reports/mine")

  return data.reports || []
}

export async function deleteReport(id) {
  return request(
    `/reports/${id}`,
    {
      method: "DELETE",
    }
  )
}

/* --------------------------------------------------
   SOS
-------------------------------------------------- */

export async function createSosSession(
  location
) {
  const data =
    await request(
      "/sos/session",
      {
        method: "POST",

        body: JSON.stringify(
          location
        ),
      }
    )

  return data.session
}


/* --------------------------------------------------
   USER AUTHENTICATION
-------------------------------------------------- */

export async function registerUser(
  name,
  email,
  password
) {
  const data =
    await request(
      "/auth/register",
      {
        method: "POST",

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    )

  if (data.token) {
    localStorage.setItem(
      "anzen_user_token",
      data.token
    )
  }

  return data
}


export async function loginUser(
  email,
  password
) {
  const data =
    await request(
      "/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

  if (data.token) {
    localStorage.setItem(
      "anzen_user_token",
      data.token
    )
  }

  return data
}


export async function getCurrentUser() {
  return request(
    "/auth/me"
  )
}


export function logoutUser() {
  localStorage.removeItem(
    "anzen_user_token"
  )
}


export function isUserLoggedIn() {
  return Boolean(
    getUserToken()
  )
}


/* --------------------------------------------------
   ADMIN AUTHENTICATION
-------------------------------------------------- */

export async function adminLogin(
  email,
  password
) {
  return request(
    "/admin/login",
    {
      method: "POST",

      /*
       * The request() function automatically
       * includes the normal user token if one
       * exists. Admin login itself does not
       * require authentication, so no issue.
       */

      body: JSON.stringify({
        email,
        password,
      }),
    }
  )
}


/* --------------------------------------------------
   ADMIN DASHBOARD
-------------------------------------------------- */

export async function getAdminDashboard(
  token
) {
  return request(
    "/admin/dashboard",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  )
}


/* --------------------------------------------------
   ADMIN HAZARD MANAGEMENT
-------------------------------------------------- */

export async function updateHazardStatus(
  id,
  status,
  token
) {
  return request(
    `/hazards/${id}`,
    {
      method: "PATCH",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        status,
      }),
    }
  )
}


export async function deleteHazard(
  id,
  token
) {
  return request(
    `/hazards/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  )
}