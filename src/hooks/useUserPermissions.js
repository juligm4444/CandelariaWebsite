import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useUserPermissions = () => {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    const isInternal = !!user?.is_internal;
    const internalRole = user?.internal_role || null;
    const isLeader = !!user?.is_team_leader;
    const isColeader = !!user?.is_coleader;

    return {
      isAuthenticated,
      isInternal,
      isExternal: isAuthenticated && !isInternal,
      internalRole,
      canCreatePosts: isInternal,
      canManageTeam: isInternal && (isLeader || isColeader),
      canAccessInventory: isInternal,
      canEditProfile: isAuthenticated,
      canSavePosts: isAuthenticated,
      canMakePayments: isAuthenticated,
      canInviteMembers: isInternal && (isLeader || isColeader),
    };
  }, [isAuthenticated, user]);
};

export default useUserPermissions;
