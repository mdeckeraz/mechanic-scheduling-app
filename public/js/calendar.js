document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Calendar date navigation
  const calendarDatePrev = document.getElementById('calendarDatePrev');
  const calendarDateNext = document.getElementById('calendarDateNext');
  const calendarDateToday = document.getElementById('calendarDateToday');
  const calendarDateDisplay = document.getElementById('calendarDateDisplay');

  if (calendarDatePrev && calendarDateNext && calendarDateToday && calendarDateDisplay) {
    // Set initial date display
    updateDateDisplay();

    // Set up event listeners
    calendarDatePrev.addEventListener('click', () => {
      const calendar = getCalendarInstance();
      if (calendar) {
        calendar.prev();
        updateDateDisplay();
      }
    });

    calendarDateNext.addEventListener('click', () => {
      const calendar = getCalendarInstance();
      if (calendar) {
        calendar.next();
        updateDateDisplay();
      }
    });

    calendarDateToday.addEventListener('click', () => {
      const calendar = getCalendarInstance();
      if (calendar) {
        calendar.today();
        updateDateDisplay();
      }
    });
  }

  // Helper function to get the FullCalendar instance
  function getCalendarInstance() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
      return calendarEl._calendar;
    }
    return null;
  }

  // Helper function to update the date display
  function updateDateDisplay() {
    const calendar = getCalendarInstance();
    if (calendar && calendarDateDisplay) {
      const view = calendar.view;
      const viewTitle = calendar.view.title;
      calendarDateDisplay.textContent = viewTitle;
    }
  }

  // Job quick actions
  document.addEventListener('click', (e) => {
    // Handle job status change buttons
    if (e.target.classList.contains('job-status-btn')) {
      e.preventDefault();
      const jobId = e.target.dataset.jobId;
      const newStatus = e.target.dataset.status;
      
      if (jobId && newStatus) {
        updateJobStatus(jobId, newStatus);
      }
    }
  });

  // Function to update job status
  async function updateJobStatus(jobId, newStatus) {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh calendar to show updated status
        const calendar = getCalendarInstance();
        if (calendar) {
          calendar.refetchEvents();
        }
        
        // Show success message
        showAlert('calendarAlert', `Job status updated to ${newStatus}`, 'success');
        
        // Close modal if open
        const jobModal = document.getElementById('jobModal');
        if (jobModal) {
          const bsModal = bootstrap.Modal.getInstance(jobModal);
          if (bsModal) {
            bsModal.hide();
          }
        }
      } else {
        showAlert('calendarAlert', data.message || 'Failed to update job status', 'danger');
      }
    } catch (error) {
      console.error('Update job status error:', error);
      showAlert('calendarAlert', 'An error occurred while updating job status', 'danger');
    }
  }

  // Helper function to show alerts
  function showAlert(elementId, message, type) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
      alertElement.textContent = message;
      alertElement.className = `alert alert-${type}`;
      alertElement.classList.remove('d-none');
      
      // Auto hide alert after 5 seconds
      setTimeout(() => {
        alertElement.classList.add('d-none');
      }, 5000);
    }
  }
});
