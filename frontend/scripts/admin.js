// Admin logic
document.addEventListener('DOMContentLoaded', () => {
  if(getAdminToken()) {
    adminFetch('/auth/verify').then(res => {
      if(res.success) { showDashboard(); }
      else { localStorage.removeItem('adminToken'); }
    });
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const res = await adminLogin(u, p);
    if(res.success) {
      localStorage.setItem('adminToken', res.token);
      document.getElementById('login-err').classList.add('hidden');
      showDashboard();
    } else {
      document.getElementById('login-err').classList.remove('hidden');
    }
  });

  // Forms
  document.getElementById('form-program').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prog-id').value;
    const data = {
      title: document.getElementById('prog-title').value,
      ageGroup: document.getElementById('prog-age').value,
      description: document.getElementById('prog-desc').value
    };
    if (id) await adminFetch(`/program/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await adminFetch('/program', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset(); document.getElementById('prog-id').value = '';
    document.getElementById('prog-form-container').classList.add('hidden');
    loadProgramsList();
  });

  document.getElementById('form-announcement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('ann-id').value;
    const data = {
      title: document.getElementById('ann-title').value,
      description: document.getElementById('ann-desc').value
    };
    if (id) await adminFetch(`/announcement/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    else await adminFetch('/announcement', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset(); document.getElementById('ann-id').value = '';
    document.getElementById('ann-form-container').classList.add('hidden');
    loadAnnouncementsList();
  });

  document.getElementById('form-content').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      aboutText: document.getElementById('cont-about').value,
      contactEmail: document.getElementById('cont-email').value,
      phoneNumber: document.getElementById('cont-phone').value,
      address: document.getElementById('cont-address').value,
      schoolTimings: document.getElementById('cont-timings').value
    };
    await adminFetch('/content', { method: 'PUT', body: JSON.stringify(data) });
    alert('Content updated successfully.');
  });

  document.getElementById('form-gallery').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const fileInp = document.getElementById('gal-file');
    const urlInp = document.getElementById('gal-url');
    const altInp = document.getElementById('gal-alt');
    
    let imageUrl = urlInp.value;
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      // If file is selected, upload it first
      if (fileInp.files.length > 0) {
        btn.textContent = 'Uploading Image...';
        const formData = new FormData();
        formData.append('image', fileInp.files[0]);
        
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'x-admin-token': getAdminToken() },
          body: formData
        }).then(r => r.json());

        if (uploadRes.success) {
          imageUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.message || 'Upload failed');
        }
      }

      if (!imageUrl) {
        throw new Error('Please select a file or enter an image URL.');
      }

      btn.textContent = 'Saving to Database...';
      const data = { imageUrl, altText: altInp.value };
      const res = await adminFetch('/gallery', { method: 'POST', body: JSON.stringify(data) });
      
      if (res.success) {
        alert('Gallery updated successfully!');
        e.target.reset();
        document.getElementById('gal-form-container').classList.add('hidden');
        loadGalleryList();
      } else {
        throw new Error(res.message || 'Failed to save to gallery');
      }
    } catch (err) {
      console.error('Gallery Error:', err);
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add to Gallery';
    }
  });
});

function showDashboard() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  showTab('dashboard');
}

function logout() {
  localStorage.removeItem('adminToken');
  location.reload();
}

window.showTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('tab-' + tabId).classList.remove('hidden');
  
  if (tabId === 'dashboard') loadStats();
  if (tabId === 'registrations') loadRegistrations();
  if (tabId === 'reviews') loadReviewsList();
  if (tabId === 'programs') loadProgramsList();
  if (tabId === 'announcements') loadAnnouncementsList();
  if (tabId === 'messages') loadMessagesList();
  if (tabId === 'gallery') loadGalleryList();
  if (tabId === 'content') loadContentData();
};

async function loadStats() {
  const reg = await adminFetch('/registration');
  const rev = await adminFetch('/review/all');
  const prog = await fetchPrograms();
  if(reg.success) document.getElementById('stat-reg').textContent = reg.total || reg.data.length;
  if(rev.success) {
    document.getElementById('stat-rev').textContent = rev.data.length;
    document.getElementById('stat-pend').textContent = rev.data.filter(r => !r.isApproved).length;
  }
  if(prog.success) document.getElementById('stat-prog').textContent = prog.data.length;
}

async function loadRegistrations() {
  const res = await adminFetch('/registration');
  if(!res.success) return;
  const tbody = document.getElementById('list-registrations');
  tbody.innerHTML = res.data.map(r => `
    <tr class="border-b"><td class="p-4">${new Date(r.createdAt).toLocaleDateString()}</td><td class="p-4 font-bold">${r.parentName}</td><td class="p-4"><a href="mailto:${r.email}" class="text-blue-500 hover:underline">${r.email || 'N/A'}</a></td><td class="p-4">${r.childAge}</td><td class="p-4">${r.phone}</td><td class="p-4">${r.inquiryType}</td><td class="p-4 text-sm">${r.message}</td>
    <td class="p-4"><button onclick="deleteItem('/registration/${r._id}', loadRegistrations)" class="text-red-500 hover:underline">Delete</button></td></tr>
  `).join('');
}

async function loadReviewsList() {
  const res = await adminFetch('/review/all');
  if(!res.success) return;
  const tbody = document.getElementById('list-reviews');
  tbody.innerHTML = res.data.map(r => `
    <tr class="border-b"><td class="p-4">${r.parentName}</td><td class="p-4"><a href="mailto:${r.email}" class="text-blue-500 hover:underline">${r.email || 'N/A'}</a></td><td class="p-4">${r.rating}/5</td><td class="p-4 text-sm">${r.reviewText}</td>
    <td class="p-4"><span class="${r.isApproved ? 'text-green-500' : 'text-orange-500'} font-bold">${r.isApproved ? 'Approved' : 'Pending'}</span></td>
    <td class="p-4">
      <button onclick="toggleReview('${r._id}', ${!r.isApproved})" class="text-blue-500 hover:underline mr-2">${r.isApproved ? 'Reject' : 'Approve'}</button>
      <button onclick="deleteItem('/review/${r._id}', loadReviewsList)" class="text-red-500 hover:underline">Delete</button>
    </td></tr>
  `).join('');
}

window.toggleReview = async function(id, isApproved) {
  await adminFetch(`/review/${id}`, { method: 'PUT', body: JSON.stringify({ isApproved }) });
  loadReviewsList();
};

async function loadProgramsList() {
  const res = await fetchPrograms();
  if(!res.success) return;
  const tbody = document.getElementById('list-programs');
  tbody.innerHTML = res.data.map(p => {
    const escTitle = p.title.replace(/'/g, "\\'");
    const escAge = p.ageGroup.replace(/'/g, "\\'");
    const escDesc = p.description.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `
    <tr class="border-b"><td class="p-4 font-bold">${p.title}</td><td class="p-4">${p.ageGroup}</td><td class="p-4 text-sm">${p.description}</td>
    <td class="p-4">
      <button onclick="editProgram('${p._id}', '${escTitle}', '${escAge}', '${escDesc}')" class="text-blue-500 hover:underline mr-2">Edit</button>
      <button onclick="deleteItem('/program/${p._id}', loadProgramsList)" class="text-red-500 hover:underline">Delete</button>
    </td></tr>`;
  }).join('');
}

async function loadAnnouncementsList() {
  const res = await fetchAnnouncements();
  if(!res.success) return;
  const tbody = document.getElementById('list-announcements');
  tbody.innerHTML = res.data.map(a => {
    const escTitle = a.title.replace(/'/g, "\\'");
    const escDesc = a.description.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `
    <tr class="border-b"><td class="p-4">${new Date(a.date).toLocaleDateString()}</td><td class="p-4 font-bold">${a.title}</td><td class="p-4 text-sm">${a.description}</td>
    <td class="p-4">
      <button onclick="editAnnouncement('${a._id}', '${escTitle}', '${escDesc}')" class="text-blue-500 hover:underline mr-2">Edit</button>
      <button onclick="deleteItem('/announcement/${a._id}', loadAnnouncementsList)" class="text-red-500 hover:underline">Delete</button>
    </td></tr>`;
  }).join('');
}

async function loadMessagesList() {
  const res = await adminFetch('/contact');
  if(!res.success) return;
  const tbody = document.getElementById('list-messages');
  tbody.innerHTML = res.data.map(m => `
    <tr class="border-b"><td class="p-4">${new Date(m.createdAt).toLocaleDateString()}</td><td class="p-4 font-bold">${m.name}</td><td class="p-4"><a href="mailto:${m.email}" class="text-blue-500 hover:underline">${m.email}</a></td><td class="p-4 text-sm">${m.message}</td>
    <td class="p-4"><button onclick="deleteItem('/contact/${m._id}', loadMessagesList)" class="text-red-500 hover:underline">Delete</button></td></tr>
  `).join('');
}

async function loadContentData() {
  const res = await fetchContent();
  if(!res.success) return;
  const c = res.data;
  document.getElementById('cont-about').value = c.aboutText || '';
  document.getElementById('cont-email').value = c.contactEmail || '';
  document.getElementById('cont-phone').value = c.phoneNumber || '';
  document.getElementById('cont-address').value = c.address || '';
  document.getElementById('cont-timings').value = c.schoolTimings || '';
}

async function loadGalleryList() {
  const res = await fetchGallery();
  if(!res.success) return;
  const container = document.getElementById('list-gallery');
  container.innerHTML = res.data.map((img, index) => {
    const isLocal = img.imageUrl.startsWith('/uploads');
    const imageBase = (typeof RENDER_API !== 'undefined') ? RENDER_API.replace('/api', '') : API_BASE.replace('/api', '');
    const finalUrl = isLocal ? `${imageBase}${img.imageUrl}` : img.imageUrl;
    return `
    <div data-id="${img._id}" class="relative group border rounded-lg overflow-hidden h-40 cursor-move bg-white shadow-sm">
      <img src="${finalUrl}" class="w-full h-full object-cover pointer-events-none">
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <div class="flex gap-2">
          <button onclick="moveGalleryItem('${img._id}', -1)" class="bg-blue-600 text-white p-1 rounded hover:bg-blue-700" title="Move Up">
            <span class="material-symbols-outlined text-sm">arrow_upward</span>
          </button>
          <button onclick="moveGalleryItem('${img._id}', 1)" class="bg-blue-600 text-white p-1 rounded hover:bg-blue-700" title="Move Down">
            <span class="material-symbols-outlined text-sm">arrow_downward</span>
          </button>
        </div>
        <button onclick="deleteItem('/gallery/${img._id}', loadGalleryList)" class="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold hover:bg-red-50">Delete</button>
      </div>
      <div class="absolute bottom-0 left-0 right-0 bg-white/90 p-1 text-[10px] truncate pointer-events-none">${img.altText}</div>
    </div>
  `;
  }).join('');

  // Initialize Sortable
  new Sortable(container, {
    animation: 150,
    ghostClass: 'opacity-50',
    onEnd: async function() {
      const orderings = Array.from(container.children).map((el, idx) => ({
        id: el.getAttribute('data-id'),
        order: idx
      }));
      
      await adminFetch('/gallery/order', {
        method: 'PUT',
        body: JSON.stringify({ orderings })
      });
    }
  });
}

window.moveGalleryItem = async function(id, direction) {
  const res = await fetchGallery();
  if (!res.success) return;
  
  let items = res.data;
  const index = items.findIndex(item => item._id === id);
  if (index === -1) return;
  
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= items.length) return;
  
  // Swap items
  [items[index], items[newIndex]] = [items[newIndex], items[index]];
  
  // Create ordering array for backend
  const orderings = items.map((item, idx) => ({ id: item._id, order: idx }));
  
  const saveRes = await adminFetch('/gallery/order', {
    method: 'PUT',
    body: JSON.stringify({ orderings })
  });
  
  if (saveRes.success) {
    loadGalleryList();
  }
};

window.deleteItem = async function(endpoint, callback) {
  if(!confirm('Are you sure you want to delete this item?')) return;
  await adminFetch(endpoint, { method: 'DELETE' });
  callback();
};

window.editProgram = function(id, title, ageGroup, description) {
  document.getElementById('prog-id').value = id;
  document.getElementById('prog-title').value = title;
  document.getElementById('prog-age').value = ageGroup;
  document.getElementById('prog-desc').value = description;
  document.getElementById('prog-form-container').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.editAnnouncement = function(id, title, description) {
  document.getElementById('ann-id').value = id;
  document.getElementById('ann-title').value = title;
  document.getElementById('ann-desc').value = description;
  document.getElementById('ann-form-container').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
