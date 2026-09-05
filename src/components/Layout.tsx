import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Group, Text } from '@mantine/core'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box mih="100vh">
      <Box
        component="header"
        bg="white"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Container size="md">
          <Group h={60} gap={10}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap={10}>
                <Box
                  w={28}
                  h={28}
                  bg="teal.6"
                  style={{
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Text c="white" fw={700} size="sm" lh={1}>
                    M
                  </Text>
                </Box>
                <Text fw={700} size="lg">
                  MediSearch
                </Text>
              </Group>
            </Link>
          </Group>
        </Container>
      </Box>

      <Container size="md" py="xl">
        {children}
      </Container>
    </Box>
  )
}
