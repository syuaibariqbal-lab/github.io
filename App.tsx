import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  PlusCircle,
  Printer,
  Boxes,
  LayoutGrid,
  BarChart3,
  Search,
  Filter,
  PackagePlus,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  LabItem,
  Room,
  ContainerPosition,
  SchoolProfile,
  ItemCategory,
  ItemStatus,
} from './types/inventory';
import {
  getStoredItems,
  saveItems,
  getStoredRooms,
  saveRooms,
  getStoredPositions,
  savePositions,
  getStoredSchoolProfile,
  saveSchoolProfile,
} from './services/storage';

import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { ItemFilterBar } from './components/ItemFilterBar';
import { ItemList } from './components/ItemList';
import { ItemFormModal } from './components/ItemFormModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { RoomContainerManager } from './components/RoomContainerManager';
import { AnalyticsView } from './components/AnalyticsView';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  // Main Data States
  const [items, setItems] = useState<LabItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [positions, setPositions] = useState<ContainerPosition[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(getStoredSchoolProfile());

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'items' | 'rooms' | 'analytics' | 'print'>('items');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'nama_asc' | 'nama_desc' | 'jumlah_desc' | 'jumlah_asc' | 'terbaru'>('nama_asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<LabItem | null>(null);

  const [selectedDetailItem, setSelectedDetailItem] = useState<LabItem | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printInitialRoom, setPrintInitialRoom] = useState<string>('ALL');
  const [printInitialPosition, setPrintInitialPosition] = useState<string>('ALL');

  // Load initial data
  const reloadData = () => {
    setItems(getStoredItems());
    setRooms(getStoredRooms());
    setPositions(getStoredPositions());
    setSchoolProfile(getStoredSchoolProfile());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Save changes to storage whenever items, rooms, or positions update
  const handleSaveItems = (newItems: LabItem[]) => {
    setItems(newItems);
    saveItems(newItems);
  };

  const handleSaveRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
    saveRooms(newRooms);
  };

  const handleSavePositions = (newPositions: ContainerPosition[]) => {
    setPositions(newPositions);
    savePositions(newPositions);
  };

  const handleUpdateSchoolProfile = (profile: SchoolProfile) => {
    setSchoolProfile(profile);
    saveSchoolProfile(profile);
  };

  // Item CRUD Actions
  const handleSaveItem = (itemToSave: LabItem) => {
    const exists = items.some((i) => i.id === itemToSave.id);
    let updated: LabItem[];
    if (exists) {
      updated = items.map((i) => (i.id === itemToSave.id ? itemToSave : i));
    } else {
      updated = [itemToSave, ...items];
    }
    handleSaveItems(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (confirm(`Apakah Anda yakin ingin menghapus item "${item.namaItem}"?`)) {
      const updated = items.filter((i) => i.id !== itemId);
      handleSaveItems(updated);
      if (selectedDetailItem?.id === itemId) {
        setSelectedDetailItem(null);
      }
    }
  };

  const handleQuickUpdateQuantity = (itemId: string, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(0, (Number(item.jumlah) || 0) + delta);
        return {
          ...item,
          jumlah: newQty,
          terakhirDiperiksa: new Date().toISOString().slice(0, 10),
        };
      }
      return item;
    });
    handleSaveItems(updated);
  };

  const handleQuickUpdateStatus = (itemId: string, newStatus: ItemStatus) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          terakhirDiperiksa: new Date().toISOString().slice(0, 10),
        };
      }
      return item;
    });
    handleSaveItems(updated);
    if (selectedDetailItem && selectedDetailItem.id === itemId) {
      setSelectedDetailItem({ ...selectedDetailItem, status: newStatus });
    }
  };

  // Room CRUD Actions
  const handleSaveRoom = (room: Room) => {
    const exists = rooms.some((r) => r.id === room.id);
    let updated: Room[];
    if (exists) {
      updated = rooms.map((r) => (r.id === room.id ? room : r));
    } else {
      updated = [...rooms, room];
    }
    handleSaveRooms(updated);
  };

  const handleDeleteRoom = (roomId: string) => {
    const updated = rooms.filter((r) => r.id !== roomId);
    handleSaveRooms(updated);
    if (selectedRoom === roomId) {
      setSelectedRoom('ALL');
    }
  };

  // Position CRUD Actions
  const handleSavePosition = (pos: ContainerPosition) => {
    const exists = positions.some((p) => p.id === pos.id);
    let updated: ContainerPosition[];
    if (exists) {
      updated = positions.map((p) => (p.id === pos.id ? pos : p));
    } else {
      updated = [...positions, pos];
    }
    handleSavePositions(updated);
  };

  const handleDeletePosition = (posId: string) => {
    const updated = positions.filter((p) => p.id !== posId);
    handleSavePositions(updated);
    if (selectedPosition === posId) {
      setSelectedPosition('ALL');
    }
  };

  // Quick Open Modal Helpers
  const handleOpenAddItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenAddItemWithLocation = (roomId: string, posId: string) => {
    setItemToEdit({
      id: `item-${Date.now()}`,
      kodeItem: `ITEM-${Math.floor(100 + Math.random() * 900)}`,
      namaItem: '',
      ruangId: roomId,
      posisiId: posId,
      kategori: 'Kaca',
      status: 'Baik',
      jumlah: 1,
      satuan: 'Unit',
      ringkasan: '',
      spesifikasi: '',
      merk: '',
      tanggalInput: new Date().toISOString().slice(0, 10),
      terakhirDiperiksa: new Date().toISOString().slice(0, 10),
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: LabItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  // Print Handlers
  const handleOpenPrintModal = (roomId: string = 'ALL', posId: string = 'ALL') => {
    setPrintInitialRoom(roomId);
    setPrintInitialPosition(posId);
    setIsPrintModalOpen(true);
  };

  // Filter items based on user criteria
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.namaItem.toLowerCase().includes(q);
          const matchCode = (item.kodeItem || '').toLowerCase().includes(q);
          const matchSummary = (item.ringkasan || '').toLowerCase().includes(q);
          const matchSpec = (item.spesifikasi || '').toLowerCase().includes(q);
          const matchBrand = (item.merk || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchSummary && !matchSpec && !matchBrand) {
            return false;
          }
        }

        // Room
        if (selectedRoom !== 'ALL' && item.ruangId !== selectedRoom) {
          return false;
        }

        // Position
        if (selectedPosition !== 'ALL' && item.posisiId !== selectedPosition) {
          return false;
        }

        // Category
        if (selectedCategory !== 'ALL' && item.kategori !== selectedCategory) {
          return false;
        }

        // Status
        if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nama_asc') return a.namaItem.localeCompare(b.namaItem);
        if (sortBy === 'nama_desc') return b.namaItem.localeCompare(a.namaItem);
        if (sortBy === 'jumlah_desc') return b.jumlah - a.jumlah;
        if (sortBy === 'jumlah_asc') return a.jumlah - b.jumlah;
        if (sortBy === 'terbaru') return b.terakhirDiperiksa.localeCompare(a.terakhirDiperiksa);
        return 0;
      });
  }, [items, searchQuery, selectedRoom, selectedPosition, selectedCategory, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoom('ALL');
    setSelectedPosition('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSortBy('nama_asc');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'print') {
            handleOpenPrintModal('ALL', 'ALL');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddItem={handleOpenAddItem}
        onOpenPrint={() => handleOpenPrintModal('ALL', 'ALL')}
        schoolProfile={schoolProfile}
        onUpdateSchoolProfile={handleUpdateSchoolProfile}
        onDataChanged={reloadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Overview (Visible across tabs) */}
        <StatsCards
          items={items}
          selectedStatusFilter={selectedStatus}
          onSelectStatusFilter={(st) => {
            setSelectedStatus(st);
            if (activeTab !== 'items') setActiveTab('items');
          }}
          selectedCategoryFilter={selectedCategory}
          onSelectCategoryFilter={(cat) => {
            setSelectedCategory(cat);
            if (activeTab !== 'items') setActiveTab('items');
          }}
        />

        {/* TAB 1: Daftar Item Inventaris */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <ItemFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRoom={selectedRoom}
              onRoomChange={setSelectedRoom}
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              rooms={rooms}
              positions={positions}
              onResetFilters={handleResetFilters}
              totalFiltered={filteredItems.length}
              totalAll={items.length}
            />

            {/* Items Table / Cards */}
            <ItemList
              items={filteredItems}
              rooms={rooms}
              positions={positions}
              viewMode={viewMode}
              onEditItem={handleOpenEditItem}
              onDeleteItem={handleDeleteItem}
              onViewItemDetail={(item) => setSelectedDetailItem(item)}
              onQuickUpdateQuantity={handleQuickUpdateQuantity}
              onPrintSpecificRoom={(roomId) => handleOpenPrintModal(roomId, 'ALL')}
              onPrintSpecificPosition={(posId) => handleOpenPrintModal('ALL', posId)}
              onOpenAddItem={handleOpenAddItem}
            />
          </div>
        )}

        {/* TAB 2: Ruang & Posisi Lemari / Kontainer */}
        {activeTab === 'rooms' && (
          <RoomContainerManager
            rooms={rooms}
            positions={positions}
            items={items}
            onSaveRoom={handleSaveRoom}
            onDeleteRoom={handleDeleteRoom}
            onSavePosition={handleSavePosition}
            onDeletePosition={handleDeletePosition}
            onPrintRoom={(roomId) => handleOpenPrintModal(roomId, 'ALL')}
            onPrintPosition={(posId) => handleOpenPrintModal('ALL', posId)}
            onOpenAddItemWithLocation={handleOpenAddItemWithLocation}
            onEditItem={handleOpenEditItem}
          />
        )}

        {/* TAB 3: Rekapitulasi & Kategori */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            items={items}
            rooms={rooms}
            positions={positions}
            onPrintRoom={(roomId) => handleOpenPrintModal(roomId, 'ALL')}
            onFilterCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('items');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {schoolProfile.namaSekolah} &bull; Sistem Informasi Inventaris Laboratorium SMA
          </p>
          <div className="flex items-center gap-3">
            <span>Penanggung Jawab: {schoolProfile.kepalaLab}</span>
            <span>&bull;</span>
            <button
              onClick={() => handleOpenPrintModal('ALL', 'ALL')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Cetak Laporan
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: Add / Edit Item */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        rooms={rooms}
        positions={positions}
        onQuickAddPosition={handleSavePosition}
      />

      {/* MODAL: Item Detail */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onEdit={(item) => {
          setSelectedDetailItem(null);
          handleOpenEditItem(item);
        }}
        onDelete={handleDeleteItem}
        onPrintItemLocation={(roomId, posId) => {
          setSelectedDetailItem(null);
          handleOpenPrintModal(roomId, posId);
        }}
        rooms={rooms}
        positions={positions}
        onQuickUpdateStatus={handleQuickUpdateStatus}
      />

      {/* MODAL: Printable Official School Lab Report */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={items}
        rooms={rooms}
        positions={positions}
        schoolProfile={schoolProfile}
        initialRoomFilter={printInitialRoom}
        initialPositionFilter={printInitialPosition}
      />
    </div>
  );
}
