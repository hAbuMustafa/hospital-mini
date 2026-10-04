import { type authState } from "$lib/auth-client/auth.svelte";

export function isAdmin(user: typeof authState.user) {
  return user && user?.role === "admin";
}

export function departmentIsAllowed(
  user: typeof authState.user,
  department: number | number[]
) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(department)) {
    if (department.length) {
      return department.includes(user.affiliation);
    } else {
      return false;
    }
  } else {
    return department === user.affiliation;
  }
}

export function userIsAllowed(user: typeof authState.user, userId: string | string[]) {
  if (!user) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(userId)) {
    if (userId.length) {
      return userId.includes(user.id);
    } else {
      return false;
    }
  } else {
    return userId === user.id;
  }
}

export function roleIsAllowed(user: typeof authState.user, role: string | string[]) {
  if (!user) {
    return false;
  } else if (!user.role) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(role)) {
    if (role.length) {
      if (!role.some((r) => r.includes("*"))) {
        return role.includes(user.role);
      } else {
        return role.some((r) => user.role && user.role.includes(r.replaceAll("*", "")));
      }
    } else {
      return false;
    }
  } else {
    if (!role.includes("*")) {
      return role === user.role;
    } else {
      return user.role.includes(role.replaceAll("*", ""));
    }
  }
}

export function departmentNotBlocked(
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

export function userNotBlocked(user: typeof authState.user, userId: string | string[]) {
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

export function roleNotBlocked(user: typeof authState.user, role: string | string[]) {
  if (!user) {
    return false;
  } else if (!user.role) {
    return false;
  } else if (isAdmin(user)) {
    return true;
  } else if (Array.isArray(role)) {
    if (!role.some((r) => r.includes("*"))) {
      return !role.includes(user.role);
    } else {
      return role.every((r) => user.role && !user.role.includes(r.replaceAll("*", "")));
    }
  } else {
    if (!role.includes("*")) {
      return role !== user.role;
    } else {
      return !user.role.includes(role.replaceAll("*", ""));
    }
  }
}
