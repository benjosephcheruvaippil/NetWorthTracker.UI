import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const oneYearNetWorth = [
  { month: "Mar", value: 1200000 },
  { month: "Apr", value: 1230000 },
  { month: "May", value: 1215000 },
  { month: "Jun", value: 1290000 },
  { month: "Jul", value: 1345000 },
  { month: "Aug", value: 1380000 },
  { month: "Sep", value: 1360000 },
  { month: "Oct", value: 1425000 },
  { month: "Nov", value: 1460000 },
  { month: "Dec", value: 1490000 },
  { month: "Jan", value: 1515000 },
  { month: "Feb", value: 1550000 },
];

const starterAssets = [
  { id: 1, name: "Fixed Deposit", category: "Debt", value: 250000 },
  { id: 2, name: "Mutual Funds", category: "Equity", value: 420000 },
  { id: 3, name: "Non Convertible Debentures", category: "Debt", value: 110000 },
  { id: 4, name: "Gold", category: "Commodity", value: 185000 },
  { id: 5, name: "Real Estate", category: "Property", value: 585000 },
];

const PAGE_SIZE = 5;

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function HomePage({ assets }) {
  const latestWorth = useMemo(
    () => assets.reduce((sum, asset) => sum + Number(asset.value || 0), 0),
    [assets]
  );

  return (
    <section className="page">
      <div className="panel hero">
        <div>
          <p className="eyebrow">Net Worth Overview</p>
          <h1>Track your portfolio growth</h1>
          <p className="muted">
            Snapshot of your net worth movement over the last 12 months.
          </p>
        </div>
        <div className="worth-badge">
          <p className="muted">Current Net Worth</p>
          <strong>{formatINR(latestWorth)}</strong>
        </div>
      </div>

      <div className="panel chart-panel">
        <h2>1-Year Net Worth Trend</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={oneYearNetWorth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c8d9d0" />
              <XAxis dataKey="month" tick={{ fill: "#3f4f45", fontSize: 12 }} />
              <YAxis
                tickFormatter={(tick) => `${Math.round(tick / 100000)}L`}
                tick={{ fill: "#3f4f45", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatINR(Number(value))}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #d9e8df",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1f8f5f"
                strokeWidth={3}
                dot={{ r: 4, fill: "#1f8f5f" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function AssetsPage({ assets, onAddAsset, onSaveAsset, onDeleteAsset }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    value: "",
  });

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAssets = assets.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const submitAsset = (event) => {
    event.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedCategory = formData.category.trim();
    const numericValue = Number(formData.value);

    if (!trimmedName || !trimmedCategory || Number.isNaN(numericValue) || numericValue <= 0) {
      return;
    }

    if (editingAssetId === null) {
      onAddAsset({
        id: Date.now(),
        name: trimmedName,
        category: trimmedCategory,
        value: numericValue,
      });
      setCurrentPage(Math.ceil((assets.length + 1) / PAGE_SIZE));
    } else {
      onSaveAsset({
        id: editingAssetId,
        name: trimmedName,
        category: trimmedCategory,
        value: numericValue,
      });
    }

    setFormData({ name: "", category: "", value: "" });
    setEditingAssetId(null);
    setModalOpen(false);
  };

  const openAddModal = () => {
    setFormData({ name: "", category: "", value: "" });
    setEditingAssetId(null);
    setModalOpen(true);
  };

  const openEditModal = (asset) => {
    setFormData({
      name: asset.name,
      category: asset.category,
      value: String(asset.value),
    });
    setEditingAssetId(asset.id);
    setModalOpen(true);
  };

  const closeAssetModal = () => {
    setModalOpen(false);
    setEditingAssetId(null);
    setFormData({ name: "", category: "", value: "" });
  };

  return (
    <section className="page">
      <div className="panel asset-header">
        <div>
          <p className="eyebrow">Asset Inventory</p>
          <h1>Your Assets</h1>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          Add New Asset
        </button>
      </div>

      <div className="panel table-panel">
        <div className="asset-table">
          <div className="table-head">
            <span>Asset Name</span>
            <span>Category</span>
            <span>Value</span>
            <span>Action</span>
          </div>
          {paginatedAssets.map((asset) => (
            <div className="table-row" key={asset.id}>
              <span>{asset.name}</span>
              <span>{asset.category}</span>
              <strong>{formatINR(asset.value)}</strong>
              <div className="action-group">
                <button
                  type="button"
                  className="btn-ghost action-btn"
                  onClick={() => openEditModal(asset)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-danger action-btn"
                  onClick={() => setAssetToDelete(asset)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  type="button"
                  key={pageNumber}
                  className={`page-number ${currentPage === pageNumber ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn-ghost page-btn"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submitAsset}>
            <h2>{editingAssetId === null ? "Add New Asset" : "Edit Asset"}</h2>
            <label htmlFor="name">Asset Name</label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Sovereign Gold Bond"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              placeholder="e.g. Commodity"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <label htmlFor="value">Value (INR)</label>
            <input
              id="value"
              name="value"
              type="number"
              min="1"
              placeholder="e.g. 50000"
              value={formData.value}
              onChange={handleChange}
              required
            />

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeAssetModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingAssetId === null ? "Save Asset" : "Update Asset"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {assetToDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Delete Asset</h2>
            <p>
              Are you sure you want to delete <strong>{assetToDelete.name}</strong>?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setAssetToDelete(null)}>
                No
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDeleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SectionStubPage({ title, description }) {
  return (
    <section className="page">
      <div className="panel">
        <p className="eyebrow">Assets</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
    </section>
  );
}

function AppLayout({ isNavOpen, setNavOpen, isNavCollapsed, setNavCollapsed }) {
  const location = useLocation();
  const inAssetsSection = location.pathname.startsWith("/assets");

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, setNavOpen]);

  return (
    <div className={`app-shell ${isNavCollapsed ? "collapsed" : ""}`}>
      <button type="button" className="menu-button" onClick={() => setNavOpen((open) => !open)}>
        {isNavOpen ? "Close" : "Menu"}
      </button>
      {isNavOpen ? (
        <button type="button" className="nav-backdrop" onClick={() => setNavOpen(false)} />
      ) : null}
      <aside className={`side-nav ${isNavOpen ? "open" : ""} ${isNavCollapsed ? "collapsed" : ""}`}>
        <div className="side-nav-header">
          {!isNavCollapsed ? <h2>NetWorth</h2> : null}
          <button
            type="button"
            className="collapse-button"
            onClick={() => setNavCollapsed((collapsed) => !collapsed)}
            aria-label={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {isNavCollapsed ? "\u2630" : "\u2715"}
          </button>
        </div>
        {!isNavCollapsed ? (
          <nav>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              Home
            </NavLink>
            <div className={`nav-group ${inAssetsSection ? "active" : ""}`}>
              <NavLink
                to="/assets"
                end
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                Assets
              </NavLink>
              <div className="nav-submenu">
                <NavLink
                  to="/assets/audit-log"
                  className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                >
                  Asset Audit Log
                </NavLink>
                <NavLink
                  to="/assets/reports"
                  className={({ isActive }) => `nav-item nav-subitem ${isActive ? "active" : ""}`}
                >
                  Reports
                </NavLink>
              </div>
            </div>
          </nav>
        ) : null}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [isNavOpen, setNavOpen] = useState(false);
  const [isNavCollapsed, setNavCollapsed] = useState(false);
  const [assets, setAssets] = useState(starterAssets);

  const addAsset = (asset) => {
    setAssets((previous) => [...previous, asset]);
  };

  const saveAsset = (updatedAsset) => {
    setAssets((previous) =>
      previous.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
  };

  const deleteAsset = (assetId) => {
    setAssets((previous) => previous.filter((asset) => asset.id !== assetId));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout
              isNavOpen={isNavOpen}
              setNavOpen={setNavOpen}
              isNavCollapsed={isNavCollapsed}
              setNavCollapsed={setNavCollapsed}
            />
          }
        >
          <Route index element={<HomePage assets={assets} />} />
          <Route path="home" element={<HomePage assets={assets} />} />
          <Route
            path="assets"
            element={
              <AssetsPage
                assets={assets}
                onAddAsset={addAsset}
                onSaveAsset={saveAsset}
                onDeleteAsset={deleteAsset}
              />
            }
          />
          <Route
            path="assets/audit-log"
            element={
              <SectionStubPage
                title="Asset Audit Log"
                description="Track all add, update, and delete activity for portfolio assets."
              />
            }
          />
          <Route
            path="assets/reports"
            element={
              <SectionStubPage
                title="Reports"
                description="Generate and review reports for your asset portfolio performance."
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
