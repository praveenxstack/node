class EmployeeManager {
  constructor() {
    this.API_BASE = 'http://localhost:3000/employees';
    this.HEALTH_CHECK_URL = 'http://localhost:3000/health';
    this.employees = [];
    this.filteredEmployees = [];
    this.currentEmployee = null;
    this.isLoading = false;
    this.isSubmitting = false;
    
    this.initializeElements();
    this.bindEvents();
    this.initializeApp();
  }
  
  async initializeApp() {
    try {
      await this.checkServerHealth();
      await this.loadEmployees();
    } catch (error) {
      console.error('App initialization failed:', error);
      this.showError('Failed to connect to server. Please refresh the page.');
    }
  }
  
  async checkServerHealth() {
    try {
      const health = await this.makeRequest(this.HEALTH_CHECK_URL);
      console.log('Server health check:', health);
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Server is not responding. Please ensure the backend is running.');
    }
  }

  initializeElements() {
    // Main elements
    this.employeesContainer = document.getElementById('employeesContainer');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.errorContainer = document.getElementById('errorContainer');
    this.emptyState = document.getElementById('emptyState');
    
    // Filter elements
    this.positionFilter = document.getElementById('positionFilter');
    this.statusFilter = document.getElementById('statusFilter');
    this.shiftFilter = document.getElementById('shiftFilter');
    this.searchInput = document.getElementById('searchInput');
    
    // Modal elements
    this.employeeModal = document.getElementById('employeeModal');
    this.confirmModal = document.getElementById('confirmModal');
    this.employeeForm = document.getElementById('employeeForm');
    this.modalTitle = document.getElementById('modalTitle');
    
    // Form elements
    this.formElements = {
      name: document.getElementById('name'),
      age: document.getElementById('age'),
      position: document.getElementById('position'),
      mobile: document.getElementById('mobile'),
      email: document.getElementById('email'),
      address: document.getElementById('address'),
      salary: document.getElementById('salary'),
      shift: document.getElementById('shift'),
      status: document.getElementById('status')
    };
    
    // Error message elements
    this.errorElements = {
      name: document.getElementById('nameError'),
      age: document.getElementById('ageError'),
      position: document.getElementById('positionError'),
      mobile: document.getElementById('mobileError'),
      email: document.getElementById('emailError'),
      address: document.getElementById('addressError'),
      salary: document.getElementById('salaryError'),
      shift: document.getElementById('shiftError'),
      status: document.getElementById('statusError')
    };
    
    // Button elements
    this.addEmployeeBtn = document.getElementById('addEmployeeBtn');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.closeModal = document.getElementById('closeModal');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.submitBtn = document.getElementById('submitBtn');
    
    // Confirmation modal elements
    this.confirmMessage = document.getElementById('confirmMessage');
    this.confirmOk = document.getElementById('confirmOk');
    this.confirmCancel = document.getElementById('confirmCancel');
  }

  bindEvents() {
    // Button events
    this.addEmployeeBtn.addEventListener('click', () => this.openModal());
    this.refreshBtn.addEventListener('click', () => this.loadEmployees());
    this.closeModal.addEventListener('click', () => this.closeEmployeeModal());
    this.cancelBtn.addEventListener('click', () => this.closeEmployeeModal());
    
    // Form events
    this.employeeForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    
    // Filter events
    this.positionFilter.addEventListener('change', () => this.applyFilters());
    this.statusFilter.addEventListener('change', () => this.applyFilters());
    this.shiftFilter.addEventListener('change', () => this.applyFilters());
    this.searchInput.addEventListener('input', () => this.applyFilters());
    
    // Modal backdrop click to close
    this.employeeModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeEmployeeModal());
    this.confirmModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeConfirmModal());
    
    // Confirmation modal events
    this.confirmOk.addEventListener('click', () => this.confirmDelete());
    this.confirmCancel.addEventListener('click', () => this.closeConfirmModal());
    
    // Form validation on input
    Object.keys(this.formElements).forEach(field => {
      this.formElements[field].addEventListener('input', () => this.clearFieldError(field));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeEmployeeModal();
        this.closeConfirmModal();
      }
    });
  }

  // API Methods
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      
      if (error.name === 'TypeError') {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the server. Please check if the backend is running.');
        }
      }
      
      throw error;
    }
  }

  async loadEmployees(retryCount = 0) {
    this.setLoading(true);
    this.hideError();
    
    try {
      const data = await this.makeRequest(this.API_BASE);
      this.employees = Array.isArray(data) ? data : [data];
      this.filteredEmployees = [...this.employees];
      
      this.applyFilters();
    } catch (error) {
      console.error('Error loading employees:', error);
      
      if (retryCount < 2 && error.message.includes('Unable to connect')) {
        console.log(`Retrying connection... Attempt ${retryCount + 1}`);
        setTimeout(() => this.loadEmployees(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      this.showError(`Failed to load employees: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async createEmployee(employeeData) {
    this.setSubmitting(true);
    
    try {
      const newEmployee = await this.makeRequest(this.API_BASE, {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      
      this.employees.push(newEmployee['Data saved'] || newEmployee);
      this.applyFilters();
      this.closeEmployeeModal();
      this.showSuccess('Employee created successfully!');
      
      return newEmployee;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    } finally {
      this.setSubmitting(false);
    }
  }

  async updateEmployee(id, employeeData) {
    this.setSubmitting(true);
    
    try {
      const updatedEmployee = await this.makeRequest(`${this.API_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
      
      const index = this.employees.findIndex(e => e._id === id || e.id === id);
      if (index !== -1) {
        this.employees[index] = updatedEmployee['Data updated'] || updatedEmployee;
      }
      
      this.applyFilters();
      this.closeEmployeeModal();
      this.showSuccess('Employee updated successfully!');
      
      return updatedEmployee;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    } finally {
      this.setSubmitting(false);
    }
  }

  async deleteEmployee(id) {
    this.setLoading(true);
    
    try {
      await this.makeRequest(`${this.API_BASE}/${id}`, {
        method: 'DELETE'
      });
      
      this.employees = this.employees.filter(e => e._id !== id && e.id !== id);
      this.applyFilters();
      this.showSuccess('Employee deleted successfully!');
      
    } catch (error) {
      this.showError(`Failed to delete employee: ${error.message}`);
      throw error;
    } finally {
      this.setLoading(false);
      this.closeConfirmModal();
    }
  }

  // UI Methods
  setLoading(loading) {
    this.isLoading = loading;
    this.loadingIndicator.classList.toggle('active', loading);
    this.employeesContainer.style.opacity = loading ? '0.5' : '1';
  }

  setSubmitting(submitting) {
    this.isSubmitting = submitting;
    this.submitBtn.classList.toggle('loading', submitting);
    this.submitBtn.disabled = submitting;
    
    Object.values(this.formElements).forEach(element => {
      element.disabled = submitting;
    });
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.classList.add('active');
    this.scrollToTop();
    
    setTimeout(() => this.hideError(), 5000);
  }

  hideError() {
    this.errorContainer.classList.remove('active');
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--success-color, #10b981);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      z-index: 2000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  handleApiError(error) {
    let errorMessage = error.message;
    
    if (error.message.includes('duplicate') && error.message.includes('email')) {
      errorMessage = 'An employee with this email already exists.';
      this.showFieldError('email', errorMessage);
      return;
    }
    
    this.showError(errorMessage);
  }

  showFieldError(field, message) {
    if (this.errorElements[field]) {
      this.errorElements[field].textContent = message;
      this.formElements[field].classList.add('error');
    }
  }

  clearFieldError(field) {
    if (this.errorElements[field]) {
      this.errorElements[field].textContent = '';
      this.formElements[field].classList.remove('error');
    }
  }

  clearAllErrors() {
    Object.keys(this.errorElements).forEach(field => {
      this.clearFieldError(field);
    });
  }

  // Filter Methods
  applyFilters() {
    const position = this.positionFilter.value.toLowerCase();
    const status = this.statusFilter.value.toLowerCase();
    const shift = this.shiftFilter.value.toLowerCase();
    const searchTerm = this.searchInput.value.toLowerCase();
    
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesPosition = !position || employee.position.toLowerCase() === position;
      const matchesStatus = !status || employee.status.toLowerCase() === status;
      const matchesShift = !shift || employee.shift.toLowerCase() === shift;
      const matchesSearch = !searchTerm || 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm)) ||
        employee.address.toLowerCase().includes(searchTerm);
      
      return matchesPosition && matchesStatus && matchesShift && matchesSearch;
    });
    
    this.renderEmployees();
  }

  // Modal Methods
  openModal(employee = null) {
    this.currentEmployee = employee;
    this.clearAllErrors();
    this.employeeForm.reset();
    
    const modalSubtitle = document.getElementById('modalSubtitle');
    const submitText = document.getElementById('submitText');
    
    if (employee) {
      this.modalTitle.textContent = 'Edit Employee';
      modalSubtitle.textContent = `Update ${employee.name}'s information`;
      submitText.textContent = 'Update Employee';
      this.employeeModal.classList.add('edit-mode');
      this.populateForm(employee);
    } else {
      this.modalTitle.textContent = 'Add New Employee';
      modalSubtitle.textContent = 'Fill in the employee details below';
      submitText.textContent = 'Save Employee';
      this.employeeModal.classList.remove('edit-mode');
    }
    
    this.employeeModal.classList.add('active');
    this.employeeModal.setAttribute('aria-hidden', 'false');
    
    setTimeout(() => this.formElements.name.focus(), 100);
  }

  closeEmployeeModal() {
    this.employeeModal.classList.remove('active');
    this.employeeModal.setAttribute('aria-hidden', 'true');
    this.currentEmployee = null;
    this.clearAllErrors();
  }

  populateForm(employee) {
    Object.keys(this.formElements).forEach(field => {
      if (employee[field] !== undefined) {
        this.formElements[field].value = employee[field];
      }
    });
  }

  openConfirmModal(message, onConfirm) {
    this.confirmMessage.textContent = message;
    this.confirmCallback = onConfirm;
    this.confirmModal.classList.add('active');
    this.confirmModal.setAttribute('aria-hidden', 'false');
  }

  closeConfirmModal() {
    this.confirmModal.classList.remove('active');
    this.confirmModal.setAttribute('aria-hidden', 'true');
    this.confirmCallback = null;
  }

  confirmDelete() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
  }

  // Form Handling
  async handleFormSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    const formData = this.validateForm();
    if (!formData) return;
    
    try {
      if (this.currentEmployee) {
        await this.updateEmployee(this.currentEmployee._id || this.currentEmployee.id, formData);
      } else {
        await this.createEmployee(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }

  validateForm() {
    this.clearAllErrors();
    
    const formData = {};
    let isValid = true;
    
    const requiredFields = ['name', 'age', 'position', 'mobile', 'email', 'address', 'salary', 'shift', 'status'];
    
    requiredFields.forEach(field => {
      const value = this.formElements[field].value.trim();
      
      if (!value) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        switch (field) {
          case 'age':
            const age = parseInt(value);
            if (isNaN(age) || age < 18 || age > 100) {
              this.showFieldError(field, 'Age must be between 18 and 100');
              isValid = false;
            } else {
              formData[field] = age;
            }
            break;
            
          case 'mobile':
            formData[field] = value;
            break;
            
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              this.showFieldError(field, 'Please enter a valid email address');
              isValid = false;
            } else {
              formData[field] = value;
            }
            break;
            
          case 'salary':
            const salary = parseFloat(value);
            if (isNaN(salary) || salary < 0) {
              this.showFieldError(field, 'Please enter a valid salary amount');
              isValid = false;
            } else {
              formData[field] = salary;
            }
            break;
            
          default:
            formData[field] = value;
        }
      }
    });
    
    return isValid ? formData : null;
  }

  // Rendering Methods
  renderEmployees() {
    if (this.filteredEmployees.length === 0) {
      this.employeesContainer.innerHTML = '';
      this.emptyState.style.display = 'block';
      return;
    }
    
    this.emptyState.style.display = 'none';
    
    const employeesHTML = this.filteredEmployees.map(employee => this.createEmployeeCard(employee)).join('');
    this.employeesContainer.innerHTML = employeesHTML;
    
    // Bind card events
    this.filteredEmployees.forEach(employee => {
      const card = document.querySelector(`[data-employee-id="${employee._id || employee.id}"]`);
      if (card) {
        card.querySelector('.btn-edit').addEventListener('click', () => this.openModal(employee));
        card.querySelector('.btn-delete').addEventListener('click', () => this.handleDeleteClick(employee));
      }
    });
  }

  createEmployeeCard(employee) {
    const employeeId = employee._id || employee.id;
    const positionClass = `position-${employee.position.toLowerCase()}`;
    const statusClass = `status-${employee.status.toLowerCase()}`;
    const shiftIcon = this.getShiftIcon(employee.shift);
    const statusIcon = this.getStatusIcon(employee.status);
    
    return `
      <article class="employee-card" data-employee-id="${employeeId}">
        <div class="employee-header">
          <div>
            <h3 class="employee-name">${this.escapeHtml(employee.name)}</h3>
            <p class="employee-id">${employee.employeeId || 'N/A'}</p>
            <p class="employee-email">${this.escapeHtml(employee.email)}</p>
          </div>
          <div class="employee-badges">
            <span class="employee-position ${positionClass}">${this.getPositionIcon(employee.position)} ${employee.position}</span>
            <span class="employee-status ${statusClass}">${statusIcon} ${employee.status}</span>
          </div>
        </div>
        
        <div class="employee-details">
          <div class="employee-detail">
            <span class="detail-label">Age</span>
            <span class="detail-value">${employee.age} years</span>
          </div>
          <div class="employee-detail">
            <span class="detail-label">Mobile</span>
            <span class="detail-value">${this.escapeHtml(employee.mobile)}</span>
          </div>
          <div class="employee-detail">
            <span class="detail-label">Shift</span>
            <span class="detail-value">${shiftIcon} ${employee.shift}</span>
          </div>
          <div class="employee-detail">
            <span class="detail-label">Salary</span>
            <span class="detail-value">$${parseFloat(employee.salary).toLocaleString()}</span>
          </div>
          <div class="employee-detail full-width">
            <span class="detail-label">Address</span>
            <span class="detail-value">${this.escapeHtml(employee.address)}</span>
          </div>
        </div>
        
        <div class="employee-actions">
          <button class="btn btn-secondary btn-sm btn-edit" aria-label="Edit ${this.escapeHtml(employee.name)}">
            <span class="icon">✏️</span> Edit
          </button>
          <button class="btn btn-danger btn-sm btn-delete" aria-label="Delete ${this.escapeHtml(employee.name)}">
            <span class="icon">🗑️</span> Delete
          </button>
        </div>
      </article>
    `;
  }

  getPositionIcon(position) {
    const icons = {
      waiter: '🍽️',
      chef: '👨‍🍳',
      manager: '👔',
      bartender: '🍸',
      host: '🎩',
      dishwasher: '🧼'
    };
    return icons[position.toLowerCase()] || '💼';
  }

  getStatusIcon(status) {
    const icons = {
      active: '✅',
      'on-leave': '🏖️',
      terminated: '❌'
    };
    return icons[status.toLowerCase()] || '📊';
  }

  getShiftIcon(shift) {
    const icons = {
      morning: '🌅',
      evening: '🌆',
      night: '🌙',
      flexible: '🔄'
    };
    return icons[shift.toLowerCase()] || '⏰';
  }

  handleDeleteClick(employee) {
    this.openConfirmModal(
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      () => this.deleteEmployee(employee._id || employee.id)
    );
  }

  // Utility Methods
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: var(--danger-color, #ef4444);
    background-color: #fef2f2;
    animation: shake 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EmployeeManager();
});
