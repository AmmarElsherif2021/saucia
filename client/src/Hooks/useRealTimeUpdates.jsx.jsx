/* 
====================================================================
TANSTACK QUERY HOOKS FOR SUBSCRIPTION MANAGEMENT (IMPLEMENT SEPARATELY)
====================================================================
1. Subscription Data Hook with Real-time Updates
2. Subscription Mutation Hooks (Create/Update/Pause/Resume)
3. Active Subscription Utility Hook
====================================================================
*/


  // 5. User Subscriptions Hook
  
  
  
  // 12. Real-time Subscription Hook
//   export const useRealtimeUpdates = () => {
//     const { user } = useAuthContext();
//     const queryClient = useQueryClient();
    
//     useEffect(() => {
//       if (!user) return;
      
//       const channel = supabase
//         .channel(`user-${user.id}-updates`)
//         .on('postgres_changes', {
//           event: '*',
//           schema: 'public',
//           table: 'user_profiles',
//           filter: `id=eq.${user.id}`
//         }, () => {
//           queryClient.invalidateQueries(['userProfile', user.id]);
//         })
//         .on('postgres_changes', {
//           event: '*',
//           schema: 'public',
//           table: 'user_subscriptions',
//           filter: `user_id=eq.${user.id}`
//         }, () => {
//           queryClient.invalidateQueries(['userSubscriptions', user.id]);
//         })
//         .subscribe();
  
//       return () => channel.unsubscribe();
//     }, [user, queryClient]);
//   };
  
//   // 13. Optimistic Updates Example
//   export const useOptimisticProfileUpdate = () => {
//     const { user } = useAuthContext();
//     const queryClient = useQueryClient();
    
//     return useMutation({
//       mutationFn: (updateData) => userAPI.updateUserProfile(user.id, updateData),
//       onMutate: async (updateData) => {
//         await queryClient.cancelQueries(['userProfile', user.id]);
        
//         const previousProfile = queryClient.getQueryData(['userProfile', user.id]);
        
//         queryClient.setQueryData(['userProfile', user.id], (old) => ({
//           ...old,
//           ...updateData
//         }));
        
//         return { previousProfile };
//       },
//       onError: (err, _, context) => {
//         queryClient.setQueryData(['userProfile', user.id], context.previousProfile);
//       },
//       onSettled: () => {
//         queryClient.invalidateQueries(['userProfile', user.id]);
//       }
//     });
//   };
  
//   // 14. Admin Functions Hook

  
//   // 15. User Profile Ensure Hook (for authentication)
//   export const useEnsureUserProfile = () => {
//     const queryClient = useQueryClient();
    
//     return useMutation({
//       mutationFn: (supabaseUser) => userAPI.ensureUserProfile(supabaseUser),
//       onSuccess: (profile) => {
//         queryClient.setQueryData(['userProfile', profile.id], profile);
//       }
//     });
//   };


// // 4. Component Usage Example
// // import { useSubscriptions, useSubscriptionMutations, useActiveSubscription } from '../Hooks/useSubscriptions';

// // const SubscriptionComponent = () => {
// //   const { user } = useAuth();
// //   const { subscriptions, isLoading } = useSubscriptions();
// //   const { activeSubscription } = useActiveSubscription();
// //   const { pauseSubscription } = useSubscriptionMutations(user.id);

// //   const handlePause = async () => {
// //     if (!activeSubscription) return;
// //     await pauseSubscription({
// //       subscriptionId: activeSubscription.id,
// //       reason: 'Vacation pause'
// //     });
// //   };

// //   if (isLoading) return <Spinner />;

// //   return (
// //     <div>
// //       <h2>Active Plan: {activeSubscription?.plans?.title}</h2>
// //       <button onClick={handlePause}>Pause Subscription</button>
      
// //       <h3>All Subscriptions</h3>
// //       {subscriptions.map(sub => (
// //         <div key={sub.id}>
// //           {sub.plans.title} - {sub.status}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };
