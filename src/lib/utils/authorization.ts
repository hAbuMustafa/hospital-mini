import { type authState } from "$lib/auth-client/auth.svelte";

export function isAdmin(user: typeof authState.user) {
  return user && user?.role === "admin";
}

export function allowDepartment(
  user: typeof authState.user,
  department: number | number[]
) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(department)) {
    return department.includes(user.affiliation);
  } else {
    return department === user.affiliation;
  }
}

export function allowUser(user: typeof authState.user, userId: string | string[]) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(userId)) {
    return userId.includes(user.id);
  } else {
    return userId === user.id;
  }
}

export function allowRole(
  user: typeof authState.user,
  role: string | string[],
  exact = true
) {
  if (!user) {
    return false;
  } else if (!user.role) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(role)) {
    if (exact) {
      return role.includes(user.role);
    } else {
      return role.some((r) => user.role && r.includes(user.role));
    }
  } else {
    if (exact) {
      return role === user.role;
    } else {
      return role.includes(user.role);
    }
  }
}

export function blockDepartment(
  user: typeof authState.user,
  department: number | number[]
) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(department)) {
    return !department.includes(user.affiliation);
  } else {
    return department !== user.affiliation;
  }
}

export function blockUser(user: typeof authState.user, userId: string | string[]) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(userId)) {
    return !userId.includes(user.id);
  } else {
    return userId !== user.id;
  }
}

export function blockRole(
  user: typeof authState.user,
  role: string | string[],
  exact = true
) {
  if (!user) {
    return false;
  } else if (!user.role) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(role)) {
    if (exact) {
      return !role.includes(user.role);
    } else {
      return role.every((r) => user.role && !r.includes(user.role));
    }
  } else {
    if (exact) {
      return role !== user.role;
    } else {
      return !role.includes(user.role);
    }
  }
}
