// frontend/src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import SubscriptionForm from "../form";
import {
  Container, Heading, Box, SimpleGrid, Stat, StatLabel, StatNumber, Text,
  Table, Thead, Tr, Th, Tbody, Td, Tag, HStack, IconButton,
  Input, Flex, Spacer, Select, Button
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

// Match your backend frequency enum
const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Annual (Yearly)", value: "annual" },
  { label: "Quarterly (every 3 months)", value: "quarterly" },
  { label: "Semiannual (every 6 months)", value: "semiannual" },
  { label: "Every 4 Weeks", value: "every_4_weeks" },
  { label: "Biweekly (every 2 weeks)", value: "biweekly" },
  { label: "Weekly", value: "weekly" },
];

export default function Dashboard() {
  // --- data state ---
  const [subs, setSubs] = useState([]);
  const [summary, setSummary] = useState({ total_monthly: 0, by_category: {}, count: 0 });

  // --- ui state ---
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // --- edit state ---
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    cost: "",
    renewal_date: "",
    frequency: "monthly",
    category: "",
  });
  const [editErr, setEditErr] = useState("");

  // Attach Firebase ID token to requests
  const authFetch = async (url, options = {}) => {
    const token = await auth.currentUser?.getIdToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const loadSubs = async () => {
    const res = await authFetch("http://localhost:8000/subscriptions");
    if (!res.ok) { console.error("Failed to load subscriptions"); return; }
    const json = await res.json();
    setSubs(json);
  };

  const loadSummary = async () => {
    const res = await authFetch("http://localhost:8000/summary");
    if (!res.ok) { console.error("Failed to load summary"); return; }
    const json = await res.json();
    setSummary(json);
  };

  const refreshAll = async () => {
    await loadSubs();
    await loadSummary();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- create / delete ----
  const addSubscription = async (data) => {
    const res = await authFetch("http://localhost:8000/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) { console.error("Failed to add"); return; }
    await refreshAll();
  };

  const deleteSubscription = async (id) => {
    const res = await authFetch(`http://localhost:8000/subscriptions/${id}`, { method: "DELETE" });
    if (!res.ok) { console.error("Failed to delete"); return; }
    if (editId === id) cancelEdit();
    await refreshAll();
  };

  // ---------- Edit helpers ----------
  const toInputDate = (isoOrDateStr) => {
    const d = new Date(isoOrDateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const startEdit = (sub) => {
    setEditErr("");
    setEditId(sub.id);
    setEditData({
      name: sub.name || "",
      cost: sub.cost ?? "",
      renewal_date: toInputDate(sub.renewal_date),
      frequency: sub.frequency || "monthly",
      category: sub.category || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditErr("");
    setEditData({
      name: "",
      cost: "",
      renewal_date: "",
      frequency: "monthly",
      category: "",
    });
  };

  const saveEdit = async () => {
    try {
      setEditErr("");
      if (!editData.name.trim()) throw new Error("Name is required");
      if (!editData.cost || Number(editData.cost) <= 0) throw new Error("Cost must be > 0");
      if (!editData.renewal_date) throw new Error("Renewal date is required");

      const payload = { ...editData, cost: Number(editData.cost) };
      const res = await authFetch(`http://localhost:8000/subscriptions/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      await refreshAll();
      cancelEdit();
    } catch (e) {
      setEditErr(e.message || "Failed to update");
    }
  };

  // ---------- filters ----------
  const categories = useMemo(() => {
    const set = new Set(subs.map(s => (s.category || "Uncategorized")));
    return ["All", ...Array.from(set)];
  }, [subs]);

  const filteredSubs = subs.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.name?.toLowerCase().includes(q) ||
      (s.category || "").toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === "All" || (s.category || "Uncategorized") === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxW="6xl" py={8}>
      {/* Top bar */}
      <Flex align="center" mb={6}>
        <Heading size="lg">SubTrack</Heading>
        <Spacer />
        {/* Add sign-out or profile later */}
      </Flex>

      {/* Stats + Controls */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <StatBox label="Total Monthly" value={`$${(summary.total_monthly || 0).toFixed(2)}`} />
        <StatBox label="Subscriptions" value={summary.count || subs.length} />
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
          <Text fontSize="sm" color="gray.600">Search &amp; Filter</Text>
          <Flex mt={2} gap={2}>
            <Input
              placeholder="Search name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} maxW="220px">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Add form */}
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" mb={6}>
        <Heading size="md" mb={4}>Add Subscription</Heading>
        <SubscriptionForm onAdd={addSubscription} />
      </Box>

      {/* List */}
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="md" mb={4}>Your Subscriptions</Heading>
        {filteredSubs.length === 0 ? (
          <Box color="gray.500">No subscriptions found.</Box>
        ) : (
          <Table size="md" variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Cost</Th>
                <Th>Frequency</Th>
                <Th>Renews</Th>
                <Th>Category</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSubs.map((s) => {
                const isEditing = editId === s.id;
                return (
                  <Tr key={s.id}>
                    <Td>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <b>{s.name}</b>
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          size="sm"
                          type="number"
                          value={editData.cost}
                          onChange={(e) => setEditData({ ...editData, cost: e.target.value })}
                        />
                      ) : (
                        `$${s.cost}`
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Select
                          size="sm"
                          value={editData.frequency}
                          onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                        >
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      ) : (
                        <Tag colorScheme="purple" variant="subtle">{s.frequency}</Tag>
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          size="sm"
                          type="date"
                          value={editData.renewal_date}
                          onChange={(e) => setEditData({ ...editData, renewal_date: e.target.value })}
                        />
                      ) : (
                        new Date(s.renewal_date).toLocaleDateString()
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        />
                      ) : (
                        <Tag>{s.category || "Uncategorized"}</Tag>
                      )}
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2}>
                        {!isEditing ? (
                          <>
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="sm"
                              onClick={() => startEdit(s)}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              size="sm"
                              onClick={() => deleteSubscription(s.id)}
                              colorScheme="red"
                              variant="outline"
                            />
                          </>
                        ) : (
                          <>
                            {editErr && <Box color="crimson" fontSize="sm" mr={2}>{editErr}</Box>}
                            <Button size="sm" colorScheme="green" onClick={saveEdit}>Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                          </>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>
    </Container>
  );
}

// small stat card helper
function StatBox({ label, value }) {
  return (
    <Stat p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <StatLabel>{label}</StatLabel>
      <StatNumber>{value}</StatNumber>
    </Stat>
  );
}
