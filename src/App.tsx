import { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { 
  MantineProvider, Container, Title, SimpleGrid, Card, Text, Group, 
  Table, Badge, Paper, ThemeIcon, Loader, Center, Alert 
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import { Message as IconMessage, AlertTriangle as IconAlertTriangle, Bug as IconBug, Users as IconUsers, AlertCircle as IconAlertCircle} from 'tabler-icons-react';

interface GlobalStats {
  totalMessages: number;
  errorCount: number;
  messageCount: number;
  warningCount: number;
  avgMagnitude: number;
  uniqueUsers: number;
}

interface UserLog {
  userId: number;
  userName: string;
  totalMessages: number;
  errors: number;
  lastMessage: string;
}

interface ActivityLog {
  date: string;
  messages: number;
  errors: number;
  warnings: number;
  formattedDate?: string;
}

interface TopUserSimple {
  userId: number;
  userName: string;
  messageCount: number;
}

interface DashboardData {
  global: GlobalStats;
  users: UserLog[];
  activity: ActivityLog[];
  topUsers: TopUserSimple[];
}

// Tuto adresu změň podle toho, kde běží backend
const API_BASE_URL = 'http://localhost:5151';

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGlobal, resUsers, resActivity, resTopUsers] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stats/messages/summary`),
          fetch(`${API_BASE_URL}/api/stats/messages/by-user`),
          fetch(`${API_BASE_URL}/api/stats/messages/by-day`),
          fetch(`${API_BASE_URL}/api/stats/messages/top-users`)
        ]);

        if (!resGlobal.ok || !resUsers.ok || !resActivity.ok || !resTopUsers.ok) {
          throw new Error('Chyba při načítání dat ze serveru');
        }

        const globalData = await resGlobal.json();
        const usersData = await resUsers.json();
        const activityData = await resActivity.json();
        const topUsersData = await resTopUsers.json();

        const formattedActivity = activityData.map((item: ActivityLog) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString('cs-CZ')
        }));

        setData({
          global: globalData,
          users: usersData,
          activity: formattedActivity,
          topUsers: topUsersData
        });
      } catch (err) {
        console.error(err);
        setError('Nepodařilo se načíst data. Zkontroluj, zda běží backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" type="bars" />
      </Center>
    );
  }

  if (error || !data) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Chyba" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  const { global, users, activity, topUsers } = data;

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">MonoLogger Dashboard</Title>

      {/* KARTY */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
        <StatCard title="Celkem zpráv" value={global.totalMessages} icon={<IconMessage size={24} />} color="blue" />
        <StatCard title="Chyby" value={global.errorCount} icon={<IconBug size={24} />} color="red" />
        <StatCard title="Varování" value={global.warningCount} icon={<IconAlertTriangle size={24} />} color="orange" />
        <StatCard title="Unikátní uživatelé" value={global.uniqueUsers} icon={<IconUsers size={24} />} color="teal" />
      </SimpleGrid>

      {/* GRAFY */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
        <Paper withBorder p="md" radius="md">
          <Title order={3} mb="md">Historie aktivity</Title>
          <AreaChart
            h={300}
            data={activity}
            dataKey="formattedDate"
            series={[
              { name: 'messages', label: 'Zprávy', color: 'indigo.6' },
              { name: 'errors', label: 'Chyby', color: 'red.6' },
            ]}
            curveType="monotone"
          />
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={3} mb="md">Nejaktivnější uživatelé</Title>
          <BarChart
            h={300}
            data={topUsers}
            dataKey="userName"
            series={[
              { name: 'messageCount', label: 'Počet zpráv', color: 'teal.6' },
            ]}
            tickLine="y"
          />
        </Paper>
      </SimpleGrid>

      {/* TABULKA */}
      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="md">Seznam uživatelů</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Uživatel</Table.Th>
              <Table.Th>Zprávy</Table.Th>
              <Table.Th>Chyby</Table.Th>
              <Table.Th>Poslední zpráva</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.userId}>
                <Table.Td>{user.userId}</Table.Td>
                <Table.Td fw={500}>{user.userName}</Table.Td>
                <Table.Td>{user.totalMessages}</Table.Td>
                <Table.Td>
                  {user.errors > 0 ? <Badge color="red">{user.errors}</Badge> : <Text c="dimmed">0</Text>}
                </Table.Td>
                <Table.Td>{new Date(user.lastMessage).toLocaleString('cs-CZ')}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

// Pomocná komponenta
function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
        <ThemeIcon color={color} variant="light">{icon}</ThemeIcon>
      </Group>
      <Text fw={700} size="xl" mt="sm">{value}</Text>
    </Card>
  );
}

export default function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Dashboard />
    </MantineProvider>
  );
}