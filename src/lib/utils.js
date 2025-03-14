
export function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    const months = [
      'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 
      'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`;
  }

  export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  }
  
  // Store filters in localStorage
  export function saveFilters(filters) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskFilters', JSON.stringify(filters));
    }
  }
  
  // Get saved filters from localStorage
  export function getSavedFilters() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskFilters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved filters', e);
        }
      }
    }
    
    return {
      departments: [],
      priorities: [],
      employee: null
    };
  }