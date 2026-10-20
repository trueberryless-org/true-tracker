export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    ...createUser('tester'),
    id: 'user',
    projects: [
      {
        archivedAt: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        description: 'First project',
        id: 'project-a',
        lastUpdatedAt: new Date('2026-01-02T00:00:00Z'),
        name: 'Alpha',
        priority: 'high',
        status: 'in progress',
        tasks: [
          {
            description: 'Build it, with commas',
            id: 'task-a',
            name: 'Build',
            priority: 'high',
            sessions: [
              {
                end: new Date('2026-01-05T10:00:00Z'),
                flow: 'smooth',
                id: 'session-a',
                start: new Date('2026-01-05T09:00:00Z'),
              },
              { end: null, flow: 'good', id: 'session-b', start: new Date('2026-01-06T09:00:00Z') },
            ],
            status: 'in progress',
          },
          { id: 'task-b', name: 'Plan', priority: 'low', sessions: [], status: 'backlog' },
        ],
      },
    ],
    visits: [{ id: 'visit-a', time: new Date('2026-01-05T12:00:00Z') }],
    ...overrides,
  }
}
