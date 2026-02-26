import { clerkClient } from '@clerk/nextjs/server'

//creates a test user if it doesn't already exist, then defines helper functions for signing in and out during tests 
 async function setupTestUser() {
  const client = await clerkClient()

  // Check if test user exists
  const { data: users } = await client.users.getUserList({
    emailAddress: ['test@example.com']
  })

  if (users.length === 0) {
    // Create test user
    const user = await client.users.createUser({
      emailAddress: ['test@example.com'],
      password: process.env.CLERK_TEST_USER_PASSWORD,
      firstName: 'Test',
      lastName: 'User'
    })
    console.log('Created test user:', user.id)
  } else {
    console.log('Test user already exists:', users[0].id)
  }
}

setupTestUser()