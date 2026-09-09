import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchUsers } from './user.api'

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export const usersQueryOptions = queryOptions({
  queryKey: userKeys.list(),
  queryFn: async () => {
    const { users } = await fetchUsers()
    return users
  },
})

export function useUsers() {
  return useQuery(usersQueryOptions)
}
