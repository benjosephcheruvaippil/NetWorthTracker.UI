import { useEffect, useMemo, useRef, useState } from "react";
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


export default function AssetAuditLogPage({ assets, onAddAsset, onSaveAsset, onDeleteAsset }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterAnchorRef = useRef(null);
  const [draftFilter, setDraftFilter] = useState({
    name: "All",
    category: "All",
    value: "",
  });
  const [appliedFilter, setAppliedFilter] = useState({
    name: "All",
    category: "All",
    value: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    value: "",
  });

  const availableNames = useMemo(
    () => ["All", ...new Set(assets.map((asset) => asset.name).filter(Boolean))],
    [assets]
  );

  const availableCategories = useMemo(
    () => ["All", ...new Set(assets.map((asset) => asset.category).filter(Boolean))],
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const valueQuery = appliedFilter.value.trim();
    return assets.filter((asset) => {
      const matchesName = appliedFilter.name === "All" || asset.name === appliedFilter.name;
      const matchesCategory =
        appliedFilter.category === "All" || asset.category === appliedFilter.category;
      const matchesValue = valueQuery.length === 0 || String(asset.value).includes(valueQuery);
      return matchesName && matchesCategory && matchesValue;
    });
  }, [assets, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isFilterPanelOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (filterAnchorRef.current && !filterAnchorRef.current.contains(event.target)) {
        setFilterPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFilterPanelOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDraftFilter((previous) => ({ ...previous, [name]: value }));
  };

  const applyFilter = () => {
    setAppliedFilter(draftFilter);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    const initialFilter = { name: "All", category: "All", value: "" };
    setDraftFilter(initialFilter);
    setAppliedFilter(initialFilter);
    setCurrentPage(1);
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
          <h1>Asset Audit Logs</h1>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          Add New Asset
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-tools">
          <div className="filter-anchor" ref={filterAnchorRef}>
            <button
              type="button"
              className="btn-ghost filter-toggle"
              onClick={() => setFilterPanelOpen((open) => !open)}
              aria-expanded={isFilterPanelOpen}
              aria-controls="assetsFilterPanel"
            >
              Filter
            </button>

            {isFilterPanelOpen ? (
              <form
                id="assetsFilterPanel"
                className="filter-popover"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="filterName">Name</label>
                <select
                  id="filterName"
                  name="name"
                  value={draftFilter.name}
                  onChange={handleFilterChange}
                >
                  {availableNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <label htmlFor="filterCategory">Category</label>
                <select
                  id="filterCategory"
                  name="category"
                  value={draftFilter.category}
                  onChange={handleFilterChange}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <label htmlFor="filterValue">Value</label>
                <input
                  id="filterValue"
                  name="value"
                  type="text"
                  placeholder="Enter value"
                  value={draftFilter.value}
                  onChange={handleFilterChange}
                />

                <div className="filter-actions">
                  <button type="button" className="btn-primary" onClick={applyFilter}>
                    Apply
                  </button>
                  <button type="button" className="btn-ghost" onClick={resetFilter}>
                    Reset
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

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
          {paginatedAssets.length === 0 ? (
            <div className="table-empty">No assets match the current filters.</div>
          ) : null}
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
