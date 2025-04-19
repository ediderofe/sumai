document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    // Check if we are on a page with the dashboard layout
    const isDashboardLayout = document.querySelector('.dashboard-layout');
    if (!isDashboardLayout) return; // Exit if not dashboard/settings layout

    const isDashboardPage = window.location.pathname.includes('dashboard.html');

    // --- Sidebar Toggle for Mobile --- //
    // Should run on any page with the sidebar
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // --- Dashboard Page Specific Logic --- //
    if (isDashboardPage) {
        console.log('Running Dashboard Page Specific Logic');
        const sidebarNav = document.querySelector('.sidebar-nav');
        const sidebarLinks = sidebarNav?.querySelectorAll('ul li a[href^="#"]'); 
        const dashboardSections = document.querySelectorAll('.dashboard-main > section.dashboard-section[id]'); // Ensure sections have IDs
        const dashboardHeaderH1 = document.querySelector('.dashboard-header h1'); // Get the H1 element

        // Simple store for selected files in the main upload area
        let selectedFilesStore = [];
        const selectedFilesListElement = document.getElementById('selected-files-list')?.querySelector('ul');
        const noFilesMessage = document.querySelector('#selected-files-list .no-files-selected');
        const uploadAllButton = document.getElementById('upload-selected-button');

        // --- Study Set Variables & Elements --- //
        const studySetSection = document.getElementById('study-sets');
        const studySetGrid = document.getElementById('study-sets-grid');
        const loadingSetsMsg = studySetGrid?.querySelector('.loading-sets');
        const addSetButton = document.getElementById('add-set-button');
        const setModal = document.getElementById('set-modal');
        const setModalTitle = document.getElementById('modal-title');
        const setForm = document.getElementById('set-form');
        const setIdInput = document.getElementById('set-id');
        const setNameInput = document.getElementById('set-name');
        const saveSetButton = document.getElementById('save-set-button');
        const closeModalButtons = document.querySelectorAll('.close-modal-btn');
        const studySetMessages = document.getElementById('study-set-messages');

        // --- Function to Personalize Greeting --- //
        async function personalizeGreeting() {
            if (!dashboardHeaderH1) return;
            try {
                const { data: { user }, error } = await supabaseClient.auth.getUser();
                if (error) {
                    console.error("Error fetching user for greeting:", error);
                    dashboardHeaderH1.textContent = "Welcome!"; // Fallback
                } else if (user) {
                    dashboardHeaderH1.textContent = `Hello, ${user.email}!`;
                } else {
                     dashboardHeaderH1.textContent = "Welcome!"; // Fallback if no user
                }
            } catch (err) {
                 console.error("Error in personalizeGreeting:", err);
                 dashboardHeaderH1.textContent = "Welcome!"; // Fallback
            }
        }

        if (!sidebarNav || !sidebarLinks || sidebarLinks.length === 0 || dashboardSections.length === 0) {
             console.error('Dashboard Error: Could not find essential elements (sidebar links or sections).');
             return; // Stop if essential elements aren't found
        }

        console.log(`Found ${sidebarLinks.length} sidebar links and ${dashboardSections.length} dashboard sections.`);

        // Function to activate a section based on ID
        function activateSection(targetId) {
            console.log(`Attempting to activate section: ${targetId}`);
            let sectionFound = false;
            let activeLinkUpdated = false;

            // Hide all sections first
            dashboardSections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                console.log(`Section ${targetId} displayed.`);
                // If activating study sets, fetch them
                if (targetId === 'study-sets') {
                    fetchStudySets();
                }
                sectionFound = true;
            } else {
                 console.warn(`Target section element with ID '${targetId}' not found.`);
                 sectionFound = false; // Explicitly set flag if section DOM element isn't found
            }

            // Update active link state in sidebar
            sidebarLinks.forEach(l => {
                if (l.getAttribute('href') === `#${targetId}`) {
                    l.parentElement.classList.add('active');
                    activeLinkUpdated = true;
                } else {
                    l.parentElement.classList.remove('active');
                }
            });

            // Ensure settings link is not active
             const settingsLink = document.querySelector('.sidebar-footer a[href="settings.html"]');
             if (settingsLink) settingsLink.classList.remove('active');


            // Default to first section if target wasn't found or no link matched
            if (!sectionFound || !activeLinkUpdated) {
                console.warn(`Target section '${targetId}' or its link not found. Defaulting to first available section.`);
                const firstLink = sidebarLinks[0];
                const firstSectionId = firstLink?.getAttribute('href')?.substring(1);
                const firstSectionElement = document.getElementById(firstSectionId);
                
                if (firstSectionElement && firstLink) {
                     // Reset all sections display
                    dashboardSections.forEach(s => s.style.display = 'none');
                    firstSectionElement.style.display = 'block'; 
                     // Reset active link state
                    sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
                    firstLink.parentElement.classList.add('active');
                    console.log(`Defaulted to section: ${firstSectionId}`);
                } else {
                    console.error('Could not default to first section.');
                }
            }
        }

        // --- Study Set Functions --- //

        // Function to display messages (success/error)
        function showStudySetMessage(message, isError = false) {
            if (!studySetMessages) return;
            studySetMessages.textContent = message;
            studySetMessages.className = isError ? 'feedback-area error' : 'feedback-area success';
            studySetMessages.style.display = 'block';
             // Optionally hide after a delay
             setTimeout(() => { studySetMessages.style.display = 'none'; }, 5000);
        }

        // Function to render study sets
        function renderStudySets(sets) {
            if (!studySetGrid || !loadingSetsMsg) return;
            studySetGrid.innerHTML = ''; // Clear loading/previous sets
            if (!sets || sets.length === 0) {
                studySetGrid.innerHTML = '<p class="loading-sets">No study sets found. Create one!</p>';
                return;
            }
            sets.forEach(set => {
                const card = document.createElement('div');
                card.className = 'study-set-card';
                card.dataset.setId = set.id;
                card.innerHTML = `
                    <h4>${escapeHTML(set.name)}</h4>
                    <!-- TODO: Add link/button to view set contents -->
                    <div class="study-set-actions">
                        <button type="button" class="edit-set-btn" data-id="${set.id}" data-name="${escapeHTML(set.name)}">Edit</button>
                        <button type="button" class="delete-set-btn" data-id="${set.id}">Delete</button>
                    </div>
                `;
                // Add event listeners for edit/delete
                card.querySelector('.edit-set-btn').addEventListener('click', handleEditSet);
                card.querySelector('.delete-set-btn').addEventListener('click', handleDeleteSet);
                studySetGrid.appendChild(card);
            });
        }

        // Function to fetch study sets from Supabase
        async function fetchStudySets() {
            if (!loadingSetsMsg) return;
            console.log('Fetching study sets...');
            loadingSetsMsg.style.display = 'block';
            studySetGrid.innerHTML = ''; // Clear grid before loading message
            studySetGrid.appendChild(loadingSetsMsg);

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                const { data, error } = await supabaseClient
                    .from('study_sets') // Replace 'study_sets' with your actual table name
                    .select('id, name')
                    .eq('user_id', user.id) // RLS should also enforce this, but good practice
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching study sets:', error);
                    showStudySetMessage(`Error loading sets: ${error.message}`, true);
                    loadingSetsMsg.textContent = 'Error loading sets.'; // Update message
                } else {
                    console.log('Study sets fetched:', data);
                    renderStudySets(data);
                }
            } catch (err) {
                console.error('Error in fetchStudySets:', err);
                showStudySetMessage(`An error occurred: ${err.message}`, true);
                 if (loadingSetsMsg) loadingSetsMsg.textContent = 'Error loading sets.';
            }
        }

        // --- Modal Handling --- //
        function openSetModal(id = null, name = '') {
            if (!setModal || !setIdInput || !setNameInput || !setModalTitle || !setForm) return;
            setForm.reset(); // Clear previous input
            setIdInput.value = id || ''; // Set ID for editing, empty for create
            setNameInput.value = name;
            setModalTitle.textContent = id ? 'Edit Study Set' : 'Create New Study Set';
            setModal.style.display = 'flex';
        }

        function closeSetModal() {
            if (!setModal || !setForm) return;
            setModal.style.display = 'none';
            setForm.reset();
        }

        // Event listeners for modal open/close
        if (addSetButton) {
            addSetButton.addEventListener('click', () => openSetModal());
        }
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeSetModal);
        });
         // Close modal if clicking outside the content
        if (setModal) {
            setModal.addEventListener('click', (event) => {
                if (event.target === setModal) { // Clicked on the background
                    closeSetModal();
                }
            });
        }

        // --- Form Submission (Create/Update) --- //
        if (setForm && saveSetButton) {
            setForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const setName = setNameInput.value.trim();
                const setId = setIdInput.value;
                if (!setName) {
                    showStudySetMessage('Set name cannot be empty.', true);
                    return;
                }
                
                saveSetButton.disabled = true;
                saveSetButton.textContent = 'Saving...';

                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (!user) throw new Error("User not logged in");

                    let response;
                    if (setId) { // Editing existing set
                        console.log(`Updating set ID: ${setId} with name: ${setName}`);
                        response = await supabaseClient
                            .from('study_sets')
                            .update({ name: setName })
                            .match({ id: setId, user_id: user.id }); // RLS protects, but good to be explicit
                    } else { // Creating new set
                        console.log(`Creating new set with name: ${setName}`);
                         response = await supabaseClient
                            .from('study_sets')
                            .insert([{ name: setName, user_id: user.id }]); // user_id might be set by default policy
                    }
                    
                    const { error } = response;
                    if (error) {
                        console.error('Error saving study set:', error);
                        showStudySetMessage(`Error saving set: ${error.message}`, true);
                    } else {
                        console.log('Study set saved successfully');
                        showStudySetMessage(`Set '${setName}' saved successfully!`);
                        closeSetModal();
                        fetchStudySets(); // Refresh the list
                    }
                } catch (err) {
                    console.error('Error in setForm submit:', err);
                    showStudySetMessage(`An error occurred: ${err.message}`, true);
                } finally {
                    saveSetButton.disabled = false;
                    saveSetButton.textContent = 'Save Set';
                }
            });
        }

         // --- Edit/Delete Handlers --- //
        function handleEditSet(event) {
            const button = event.target;
            const setId = button.dataset.id;
            const setName = button.dataset.name;
            console.log(`Editing set: ID=${setId}, Name=${setName}`);
            openSetModal(setId, setName);
        }

        async function handleDeleteSet(event) {
            const button = event.target;
            const setId = button.dataset.id;
            if (!setId) return;

            if (confirm('Are you sure you want to delete this study set? This cannot be undone.')) {
                 console.log(`Deleting set ID: ${setId}`);
                 // Optionally disable button while deleting
                 button.disabled = true;
                 button.textContent = 'Deleting...'; 
                 
                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                     if (!user) throw new Error("User not logged in");
                     
                    const { error } = await supabaseClient
                        .from('study_sets')
                        .delete()
                        .match({ id: setId, user_id: user.id }); // RLS protects, but good to be explicit

                    if (error) {
                        console.error('Error deleting study set:', error);
                        showStudySetMessage(`Error deleting set: ${error.message}`, true);
                         button.disabled = false; // Re-enable on error
                         button.textContent = 'Delete';
                    } else {
                        console.log('Study set deleted successfully');
                        showStudySetMessage('Study set deleted.');
                        fetchStudySets(); // Refresh the list
                         // The card will be removed by fetchStudySets re-rendering
                    }
                } catch (err) {
                    console.error('Error in handleDeleteSet:', err);
                    showStudySetMessage(`An error occurred: ${err.message}`, true);
                     button.disabled = false; // Re-enable on error
                     button.textContent = 'Delete';
                }
            }
        }
        
        // --- Helper to escape HTML --- //
        function escapeHTML(str) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

        // --- Initial Page Load logic --- //
        personalizeGreeting(); 
        // Activate section based on hash or default
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
             console.log(`Initial load detected hash: ${initialHash}`);
             activateSection(initialHash); // This will call fetchStudySets if hash is #study-sets
        } else {
            console.log('Initial load, no hash detected. Activating default section.');
             const firstLink = sidebarLinks[0];
             const firstSectionId = firstLink?.getAttribute('href')?.substring(1);
             if(firstSectionId) {
                 activateSection(firstSectionId);
             } else {
                  console.error('No sidebar links found to determine default section.')
             }
        }

        // --- Sidebar Navigation Click Handler --- //
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); 
                const targetId = link.getAttribute('href').substring(1);
                console.log(`Sidebar link clicked. Target: ${targetId}`);
                activateSection(targetId);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }

                // Update URL hash using pushState
                if (window.location.hash !== `#${targetId}`) {
                    history.pushState({ section: targetId }, "", `#${targetId}`);
                    console.log(`URL hash updated to #${targetId}`);
                }
            });
        });

        // Handle back/forward button navigation (popstate)
        window.addEventListener('popstate', (event) => {
            const targetId = event.state?.section || window.location.hash.substring(1);
            console.log(`Popstate event detected. Target: ${targetId || '[No State/Hash]'}`);
            if (targetId) {
                activateSection(targetId);
            } else {
                // If popstate leads to a state without hash/section (e.g., initial page state)
                // Default to the first section
                const firstLink = sidebarLinks[0];
                const firstSectionId = firstLink?.getAttribute('href')?.substring(1);
                 if(firstSectionId) {
                    activateSection(firstSectionId);
                 } 
            }
        });

        // --- File Input Trigger & Handling (Main Upload Area) --- //
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('document-upload-input'); // Use updated ID
        const selectFilesButton = uploadArea?.querySelector('.btn-primary'); // More specific selector
        const uploadFeedback = uploadArea?.querySelector('.upload-feedback p');

         // Function to format bytes
        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        // Function to update the selected files list UI
        function updateSelectedFilesUI() {
            if (!selectedFilesListElement || !noFilesMessage || !uploadAllButton) return;
            selectedFilesListElement.innerHTML = ''; // Clear current list
            if (selectedFilesStore.length === 0) {
                noFilesMessage.style.display = 'block';
                uploadAllButton.style.display = 'none';
            } else {
                noFilesMessage.style.display = 'none';
                 selectedFilesStore.forEach((file, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span class="file-name" title="${file.name}">${file.name}</span>
                        <span class="file-size">${formatBytes(file.size)}</span>
                        <button type="button" class="remove-file-btn" data-index="${index}" title="Remove file">&times;</button>
                    `;
                    // Add event listener for remove button
                    listItem.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                        const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                        selectedFilesStore.splice(indexToRemove, 1); // Remove from store
                        updateSelectedFilesUI(); // Re-render list
                    });
                    selectedFilesListElement.appendChild(listItem);
                 });
                 uploadAllButton.style.display = 'inline-block';
            }
        }

        // Function to handle newly selected files (from input or drag/drop)
        function handleNewFiles(newFiles) {
            if (!newFiles || newFiles.length === 0) return;
            // Add to store (can add checks for duplicates, size limits, types here)
            for (const file of newFiles) {
                selectedFilesStore.push(file);
                 console.log('File added:', file.name, file.size, file.type);
            }
            updateSelectedFilesUI();
             // Optional: Clear the file input value to allow selecting the same file again
             if (fileInput) fileInput.value = ''; 
        }

        if (uploadArea && fileInput && selectFilesButton) {
            // Trigger file input on button click
            selectFilesButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering uploadArea click
                fileInput.click();
            });

            // Trigger file input on upload area click (excluding button)
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            // Handle file selection via input
            fileInput.addEventListener('change', (event) => {
                handleNewFiles(event.target.files);
            });

            // --- Drag and Drop Logic --- //
            uploadArea.addEventListener('dragover', (event) => {
                event.preventDefault(); // Necessary to allow drop
                uploadArea.classList.add('dragover');
                if(uploadFeedback) uploadFeedback.textContent = 'Drop files now!';
            });

            uploadArea.addEventListener('dragleave', (event) => {
                event.preventDefault();
                 // Check if the leave event is moving towards a child element
                if (!uploadArea.contains(event.relatedTarget)) {
                    uploadArea.classList.remove('dragover');
                 }
            });

            uploadArea.addEventListener('drop', (event) => {
                event.preventDefault(); // Prevent default browser behavior (opening file)
                uploadArea.classList.remove('dragover');
                const files = event.dataTransfer.files;
                 console.log('Files dropped:', files);
                handleNewFiles(files);
            });

        } else {
            console.warn('Upload area elements not found.');
        }

        // --- Handle the "Upload All" button click --- //
        if (uploadAllButton) {
            uploadAllButton.addEventListener('click', () => {
                if (selectedFilesStore.length === 0) {
                    alert('Please select files to upload.');
                    return;
                }
                console.log('Uploading files:', selectedFilesStore);
                 alert(`Initiating upload for ${selectedFilesStore.length} file(s). Implement actual Supabase Storage upload here.`);
                // ** TODO: Implement actual upload logic here **
                // Loop through selectedFilesStore
                // For each file, call supabaseClient.storage.from('your-bucket').upload(filePath, file)
                // Handle progress, success, errors
                // After successful upload, potentially clear the list:
                // selectedFilesStore = [];
                // updateSelectedFilesUI();
            });
        }

        // --- Problem Solver Image Upload Trigger & Handling --- //
        const problemUploadButton = document.querySelector('.btn-upload-problem');
        const problemImageInput = document.getElementById('problem-image-upload');
        const problemImageNameSpan = document.getElementById('problem-image-name');

        if (problemUploadButton && problemImageInput && problemImageNameSpan) {
            problemUploadButton.addEventListener('click', () => {
                problemImageInput.click(); 
            });

            problemImageInput.addEventListener('change', (event) => {
                const files = event.target.files;
                if (files.length > 0) {
                    const file = files[0];
                    console.log('Problem image selected:', file);
                    problemImageNameSpan.textContent = file.name; // Show the selected file name
                    // ** TODO: Implement logic to handle/preview/upload this image **
                    // You might want to store this file object separately if needed for submission
                    // alert(`Image selected: ${file.name}. Implement image handling logic.`);
                } else {
                    problemImageNameSpan.textContent = ''; // Clear name if selection cancelled
                }
            });
        }

    } // End of isDashboardPage check

    // --- Logout Logic --- //
    // This should run on any page with the logout link
    const logoutLink = document.querySelector('.sidebar-footer a[href="index.html"]'); // Targeting the specific logout link

    if (logoutLink) {
        // Prevent default navigation and handle logout
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault(); // Stop browser from navigating to index.html immediately
            
            try {
                console.log('Attempting logout...');
                 // Use supabaseClient instead of supabase
                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    console.error('Supabase logout error:', error.message);
                    alert(`Logout failed: ${error.message}`); // Simple alert for logout error
                } else {
                    console.log('Supabase logout success.');
                    // Redirect to login page after successful logout
                    window.location.href = 'login.html'; 
                }
            } catch (err) {
                 console.error('Unexpected error during logout:', err);
                 alert('An unexpected error occurred during logout. Please try again.');
            }
        });
    } else {
        console.warn('Logout link not found on this page.');
    }

     // Add dashboard-body class if appropriate layout detected (runs on dash/settings)
     if (isDashboardLayout) {
         document.body.classList.add('dashboard-body');
     }

}); 