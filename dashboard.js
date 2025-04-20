document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired. dashboard.js starting...'); // <-- Log 1: Script start

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
        console.log('Dashboard Page Specific Logic block entered.'); // <-- Log 2: Block entered

        console.log('Running Dashboard Page Specific Logic');
        const sidebarNav = document.querySelector('.sidebar-nav');
        const sidebarLinks = sidebarNav?.querySelectorAll('ul li a[href^="#"]');
        console.log('Sidebar Links Found:', sidebarLinks); // <-- Log 3: Links found?

        const dashboardSections = document.querySelectorAll('.dashboard-main > section.dashboard-section[id]'); // Ensure sections have IDs
        const dashboardHeaderH1 = document.querySelector('.dashboard-header h1'); // Get the H1 element

        // --- File Upload Elements --- //
        const uploadArea = document.querySelector('.upload-area');
        const fileInput = document.getElementById('document-upload-input');
        const selectedFilesListElement = document.getElementById('selected-files-list')?.querySelector('ul');
        const noFilesMessage = document.querySelector('#selected-files-list .no-files-selected');
        const uploadAllButton = document.getElementById('upload-selected-button');
        const uploadedFilesListElement = document.getElementById('uploaded-files-list')?.querySelector('ul');
        const noUploadedFilesMessage = document.querySelector('#uploaded-files-list .no-uploaded-files');
        const uploadFeedbackArea = document.getElementById('upload-feedback-area'); // Feedback area for uploads

        // Store for files selected but not yet uploaded
        let selectedFilesStore = [];

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

        // --- NEW: Study Set Detail View Elements --- //
        const studySetsGridView = document.getElementById('study-sets-grid-view');
        const studySetDetailView = document.getElementById('study-set-detail-view');
        const detailSetNameElement = document.getElementById('detail-set-name');
        const detailSetFilesListElement = document.getElementById('detail-set-files-list')?.querySelector('ul');
        const noFilesInSetMsg = document.querySelector('#detail-set-files-list .no-files-in-set');
        const addFileToSetBtn = document.getElementById('add-file-to-set-btn');
        const backToSetsBtn = document.getElementById('back-to-sets-btn');
        let currentViewingSetId = null; // To store the ID of the set being viewed

        // --- NEW: Add File Modal Elements --- //
        const addFileModal = document.getElementById('add-file-modal');
        const addFileModalListElement = document.getElementById('add-file-modal-list')?.querySelector('ul');
        const addFileModalLoadingMsg = document.querySelector('#add-file-modal-list .loading-modal-files');
        const addFileFeedbackArea = document.getElementById('add-file-feedback-area');
        const closeAddFileModalBtns = document.querySelectorAll('.close-add-file-modal-btn');
        const confirmAddFilesBtn = document.getElementById('confirm-add-files-btn');

        // --- NEW: Edit File Modal Elements --- //
        const editFileModal = document.getElementById('edit-file-modal');
        const editFileForm = document.getElementById('edit-file-form');
        const editFileIdInput = document.getElementById('edit-file-id');
        const editFileNameInput = document.getElementById('edit-file-name');
        const editFileSetSelect = document.getElementById('edit-file-set');
        const editFileFeedbackArea = document.getElementById('edit-file-feedback-area');
        const closeEditFileModalBtns = document.querySelectorAll('.close-edit-file-modal-btn');
        const saveFileChangesBtn = document.getElementById('save-file-changes-btn');

        // --- NEW: Q&A Section Elements --- //
        const qaSourceSelect = document.getElementById('qa-source-select');
        const generateQaBtn = document.getElementById('generate-qa-btn');
        const qaFeedbackArea = document.getElementById('qa-feedback-area');
        const qaOutputArea = document.getElementById('qa-output-area');
        const qaOutputContent = qaOutputArea?.querySelector('.qa-content');
        const noQaGeneratedMsg = qaOutputArea?.querySelector('.no-qa-generated');

        // --- NEW: Solver Section Elements --- //
        const solverSourceSelect = document.getElementById('solver-source-select');
        const problemInput = document.getElementById('problem-input');
        const solveProblemBtn = document.querySelector('#solver .solver-actions .btn-primary'); // More specific selector
        const solverOutputArea = document.querySelector('#solver .solver-output-area');
        const solverOutputPlaceholder = solverOutputArea?.querySelector('.output-placeholder');
        const solverFeedbackArea = document.getElementById('solver-feedback-area'); // Assuming you might add one

        // --- NEW: Summary Section Elements --- //
        const summarySourceSelect = document.getElementById('summary-source-select');
        const viewSummaryBtn = document.getElementById('view-summary-btn');
        const summaryFeedbackArea = document.getElementById('summary-feedback-area');
        const summaryOutputArea = document.getElementById('summary-output-area');
        const summarySourceNameSpan = document.getElementById('summary-source-name'); // Span inside H3
        const summaryContentDiv = summaryOutputArea?.querySelector('.summary-content');
        const summaryLoadingMsg = summaryContentDiv?.querySelector('.loading-summary'); 

        // --- Helper Functions --- //
        function escapeHTML(str) {
            const p = document.createElement('p');
            p.textContent = str;
            return p.innerHTML;
        }

        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        // Function to display feedback messages in a specific area
        function showFeedback(areaElement, message, isError = false) {
            if (!areaElement) return;
            
            // Hide if message is empty, otherwise show and style
            if (!message || message.trim() === '') {
                areaElement.style.display = 'none';
                areaElement.textContent = '';
            } else {
                areaElement.textContent = message;
                areaElement.className = isError ? 'feedback-area error' : 'feedback-area success';
                areaElement.style.display = 'block';
                // Optionally hide after a delay
                setTimeout(() => {
                    if (areaElement) areaElement.style.display = 'none';
                 }, 5000);
            }
        }

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
            console.log(`Activate Section Called with ID: ${targetId}`);
            let sectionFound = false;
            let activeLinkUpdated = false;

            // Hide all sections first
            dashboardSections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            const targetSection = document.getElementById(targetId);
            console.log('Target Section Element Found:', targetSection);
            if (targetSection) {
                targetSection.style.display = 'block';
                console.log(`Section ${targetId} displayed.`);
                // Load data for the activated section
                if (targetId === 'study-sets') {
                    fetchStudySets();
                }
                if (targetId === 'upload') {
                    displayUploadedFiles(); // Fetch and display files when upload section is shown
                }
                if (targetId === 'qa') {
                    populateQASourceSelect(); // Populate dropdown when Q&A section is shown
                }
                if (targetId === 'solver') { // Added
                    populateSolverSourceSelect(); // Populate dropdown when Solver section is shown
                }
                if (targetId === 'summaries') { // Added
                    populateSummarySourceSelect(); // Populate dropdown when Summaries section is shown
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
                     // Load data for the default section if necessary
                     if (firstSectionId === 'study-sets') fetchStudySets();
                     if (firstSectionId === 'upload') displayUploadedFiles();
                     if (firstSectionId === 'qa') populateQASourceSelect();
                     if (firstSectionId === 'solver') populateSolverSourceSelect(); // Added
                     if (firstSectionId === 'summaries') populateSummarySourceSelect(); // Added
                } else {
                    console.error('Could not default to first section.');
                }
            }
        }

        // --- Study Set Functions --- //

        // Function to display messages (success/error)
        function showStudySetMessage(message, isError = false) {
            showFeedback(studySetMessages, message, isError);
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
                const setName = escapeHTML(set.name);
                // --- NEW Card Structure --- 
                const fileCount = set.study_set_files[0]?.count || 0; // Access count from fetched data
                const fileCountText = fileCount === 1 ? '1 file' : `${fileCount} files`;

                card.innerHTML = `
                    <div> 
                        <h4>${setName}</h4>
                        <p class="file-count">${fileCountText}</p>
                    </div>
                    <div class="file-actions">
                        <button type="button" class="btn-edit-file edit-set-btn" data-id="${set.id}" data-name="${setName}" aria-label="Edit study set ${setName}">Edit</button>
                        <button type="button" class="btn-delete-file delete-set-btn" data-id="${set.id}" aria-label="Delete study set ${setName}">×</button>
                    </div>
                `;
                // --- End NEW Card Structure ---
                
                // Add event listeners for edit/delete
                card.querySelector('.edit-set-btn').addEventListener('click', handleEditSet);
                card.querySelector('.delete-set-btn').addEventListener('click', handleDeleteSet);
                
                // Add listener to the card itself for navigation (excluding action buttons)
                card.addEventListener('click', (event) => {
                    // Only navigate if the click was NOT on an action button or within the actions div
                    if (!event.target.closest('.file-actions')) {
                        console.log(`Navigating to detail view for set ID: ${set.id}`);
                        showStudySetDetail(set.id, setName);
                    }
                });
                
                studySetGrid.appendChild(card);
            });
        }

        // --- NEW: Functions to toggle views and show set details --- //
        function showStudySetGrid() {
            if (studySetsGridView) studySetsGridView.style.display = 'block';
            if (studySetDetailView) studySetDetailView.style.display = 'none';
            currentViewingSetId = null; // Reset currently viewed set
             // Optional: Add focus back to the grid or add button?
        }

        function showStudySetDetail(setId, setName) {
            if (!studySetsGridView || !studySetDetailView || !detailSetNameElement) return;
            console.log(`Showing detail for Set ID: ${setId}, Name: ${setName}`);
            studySetsGridView.style.display = 'none';
            studySetDetailView.style.display = 'block';
            detailSetNameElement.textContent = setName; // Set the title
            currentViewingSetId = setId; // Store the current set ID
            
            // Call function to load files for this set (will be implemented next)
            fetchAndDisplayFilesInSet(setId); 
        }

        // Function to fetch and display files associated with a specific study set
        async function fetchAndDisplayFilesInSet(setId) {
            if (!detailSetFilesListElement || !noFilesInSetMsg || !setId) return;
            console.log(`Fetching files for set ID ${setId}...`);
            detailSetFilesListElement.innerHTML = ''; // Clear previous list
            noFilesInSetMsg.style.display = 'block';
            noFilesInSetMsg.textContent = 'Loading files...';

            try {
                const { data: setFiles, error: fetchError } = await supabaseClient
                    .from('study_set_files')
                    .select(`
                        id, 
                        uploaded_file_id, 
                        uploaded_files ( file_name )
                    `)
                    .eq('study_set_id', setId)
                    .order('added_at', { ascending: true });

                if (fetchError) {
                    throw new Error(`Failed to fetch files in set: ${fetchError.message}`);
                }

                if (setFiles && setFiles.length > 0) {
                    noFilesInSetMsg.style.display = 'none'; // Hide 'no files' message
                    setFiles.forEach(setFile => {
                        const fileInfo = setFile.uploaded_files;
                        if (!fileInfo) { // Check if related file data exists
                            console.warn('Associated file data missing for study_set_files id:', setFile.id);
                            return; // Skip this entry
                        }
                        const li = document.createElement('li');
                        // Ensure correct class and data-attribute for remove button
                         li.innerHTML = `
                            <span>${escapeHTML(fileInfo.file_name)}</span>
                            <div class="file-actions">
                                <button class="btn-remove-from-set" data-association-id="${setFile.id}" aria-label="Remove ${escapeHTML(fileInfo.file_name)} from set">&times;</button>
                            </div>
                        `;
                        detailSetFilesListElement.appendChild(li);
                    });
                } else {
                    noFilesInSetMsg.textContent = "No files added to this set yet.";
                }
                console.log('Displayed files in set.');

            } catch (err) {
                 console.error('Error fetching/displaying files in set:', err);
                 noFilesInSetMsg.textContent = 'Error loading files for this set.';
                 showFeedback(uploadFeedbackArea || studySetMessages, `Error loading set files: ${err.message}`, true);
            }
        }
        
        // Function to handle removing a file association from a set
        async function handleRemoveFileFromSet(associationId) {
             console.log(`handleRemoveFileFromSet called with ID: ${associationId}`); // <-- Log entry
             if (!associationId) {
                 console.error("handleRemoveFileFromSet: associationId is missing!");
                 return;
             }
             if (!confirm('Are you sure you want to remove this file from the set?')) return;

             console.log(`Removing file association ID: ${associationId}`);
             // Optionally show feedback in the detail view
             // showFeedback(detailFeedbackArea, 'Removing file from set...', false);

             try {
                const { error } = await supabaseClient
                    .from('study_set_files')
                    .delete()
                    .eq('id', associationId);

                if (error) {
                    console.error("Supabase delete error:", error); // <-- Log Supabase error
                    throw error;
                }

                console.log('File association removed successfully.');
                // showFeedback(detailFeedbackArea, 'File removed from set.', false);
                // Refresh the list for the current set
                if (currentViewingSetId) {
                     fetchAndDisplayFilesInSet(currentViewingSetId);
                } else {
                    console.warn('Cannot refresh file list, currentViewingSetId is not set.');
                }
             } catch (err) {
                 console.error('Error removing file from set:', err);
                  // showFeedback(detailFeedbackArea, `Error removing file: ${err.message}`, true);
             }
        }

        // --- Add Event Listener for Back Button --- //
        if (backToSetsBtn) {
            backToSetsBtn.addEventListener('click', showStudySetGrid);
        }

        // --- Existing Study Set Functions (fetchStudySets, openSetModal, etc.) --- //
        async function fetchStudySets() { 
            showStudySetGrid(); // Ensure grid is visible when fetching all sets
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
                    .select('id, name, study_set_files(count)') // Fetch count of related files
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

         // --- Edit/Delete Handlers for Study Sets --- //
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
        
        // --- File Upload Functions --- //

        // Function to render the list of already uploaded files
        async function displayUploadedFiles() {
            if (!uploadedFilesListElement || !noUploadedFilesMessage) return;
            console.log('Fetching uploaded files...');
            uploadedFilesListElement.innerHTML = ''; // Clear previous list
            noUploadedFilesMessage.style.display = 'block'; // Show initially
            noUploadedFilesMessage.textContent = 'Loading documents...';

            try {
                const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
                if (userError || !user) {
                    throw new Error(userError?.message || "User not logged in");
                }

                const { data: files, error: fetchError } = await supabaseClient
                    .from('uploaded_files')
                    .select('id, file_name, storage_path, uploaded_at')
                    .eq('user_id', user.id)
                    .order('uploaded_at', { ascending: false });

                if (fetchError) {
                    throw new Error(`Failed to fetch files: ${fetchError.message}`);
                }

                if (files && files.length > 0) {
                    noUploadedFilesMessage.style.display = 'none'; // Hide 'no files' message
                    files.forEach(file => {
                        const li = document.createElement('li');
                        // Add Edit button next to Delete button
                        li.innerHTML = `
                            <span>${escapeHTML(file.file_name)}</span>
                            <div class="file-actions">
                                <button class="btn-edit-file" data-file-id="${file.id}" data-file-name="${escapeHTML(file.file_name)}" aria-label="Edit file name ${escapeHTML(file.file_name)}">Edit</button>
                                <button class="btn-delete-file" data-file-id="${file.id}" data-storage-path="${escapeHTML(file.storage_path)}" aria-label="Delete ${escapeHTML(file.file_name)}">×</button>
                            </div>
                        `;
                        uploadedFilesListElement.appendChild(li);
                    });
                } else {
                    noUploadedFilesMessage.textContent = "You haven't uploaded any documents yet.";
                }
                 console.log('Uploaded files displayed.');
            } catch (err) {
                console.error('Error displaying uploaded files:', err);
                noUploadedFilesMessage.textContent = 'Error loading documents.';
                showFeedback(uploadFeedbackArea, `Error loading documents: ${err.message}`, true);
            }
        }

         // Function to handle file deletion
        async function deleteFile(fileId, storagePath) {
            if (!confirm(`Are you sure you want to delete this file? This action cannot be undone.`)) {
                return; // User cancelled
            }
            console.log(`Attempting to delete file: ID=${fileId}, Path=${storagePath}`);
            showFeedback(uploadFeedbackArea, 'Deleting file...', false);

            try {
                 // 1. Delete from Storage
                 const { error: storageError } = await supabaseClient.storage
                    .from('useruploads') // Corrected bucket name
                    .remove([storagePath]);

                 if (storageError) {
                    // Log storage error but proceed to try deleting DB record anyway
                    console.error(`Storage Deletion Error (Path: ${storagePath}):`, storageError);
                    // Optionally inform the user the file might linger in storage
                    // showFeedback(uploadFeedbackArea, `Error deleting file from storage, but attempting to remove record.`, true);
                 }

                 // 2. Delete from Database
                const { error: dbError } = await supabaseClient
                    .from('uploaded_files')
                    .delete()
                    .eq('id', fileId);

                if (dbError) {
                    throw new Error(`Database Deletion Error: ${dbError.message}`);
                }

                 console.log('File deleted successfully from DB and likely Storage.');
                 showFeedback(uploadFeedbackArea, 'File deleted successfully!', false);
                 displayUploadedFiles(); // Refresh the list

            } catch (err) {
                console.error('Error deleting file:', err);
                showFeedback(uploadFeedbackArea, `Error deleting file: ${err.message}`, true);
            }
        }

        // --- NEW: Edit File Modal Functions --- //
        async function openEditFileModal(fileId, currentFileName) {
            if (!editFileModal || !editFileForm || !editFileIdInput || !editFileNameInput || !editFileSetSelect) {
                console.error("Edit file modal elements not found.");
                return;
            }
             console.log(`Opening edit modal for file ID: ${fileId}, Name: ${currentFileName}`);

            // Reset form and feedback
            editFileForm.reset();
            showFeedback(editFileFeedbackArea, '', false);
            editFileIdInput.value = fileId;
            editFileNameInput.value = currentFileName;
            editFileSetSelect.innerHTML = '<option value="">-- Loading Sets... --</option>'; // Placeholder
            editFileSetSelect.disabled = true;
            saveFileChangesBtn.disabled = true;
            editFileModal.style.display = 'flex';

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                // Fetch study sets and current file association concurrently
                const [setsResult, currentAssociationResult] = await Promise.all([
                    supabaseClient.from('study_sets').select('id, name').eq('user_id', user.id).order('name'),
                    supabaseClient.from('study_set_files').select('study_set_id').eq('uploaded_file_id', fileId).maybeSingle() // może być null
                ]);

                const { data: studySets, error: setsError } = setsResult;
                const { data: currentAssociation, error: associationError } = currentAssociationResult;

                if (setsError) throw setsError;
                if (associationError) throw associationError;

                // Populate dropdown
                editFileSetSelect.innerHTML = '<option value="">-- Unassigned --</option>'; // Default option
                if (studySets && studySets.length > 0) {
                    studySets.forEach(set => {
                        const option = document.createElement('option');
                        option.value = set.id;
                        option.textContent = escapeHTML(set.name);
                        editFileSetSelect.appendChild(option);
                    });
                }

                // Select current association
                if (currentAssociation) {
                    editFileSetSelect.value = currentAssociation.study_set_id;
                } else {
                    editFileSetSelect.value = ""; // Select "Unassigned" if no current association
                }

                editFileSetSelect.disabled = false;
                saveFileChangesBtn.disabled = false;

            } catch (error) {
                 console.error("Error populating edit file modal:", error);
                 showFeedback(editFileFeedbackArea, `Error loading data: ${error.message}`, true);
                 editFileSetSelect.innerHTML = '<option value="">-- Error Loading --</option>';
            }
        }

        function closeEditFileModal() {
            if (editFileModal) editFileModal.style.display = 'none';
        }

        // --- Attach Event Listeners for Edit File Modal --- //
        closeEditFileModalBtns.forEach(btn => {
            btn.addEventListener('click', closeEditFileModal);
        });
        if (editFileModal) {
            editFileModal.addEventListener('click', (event) => {
                if (event.target === editFileModal) closeEditFileModal();
            });
        }
        // Edit File Form Submit Listener 
        if (editFileForm) {
            editFileForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const fileId = editFileIdInput.value;
                const newName = editFileNameInput.value.trim();
                const newSetId = editFileSetSelect.value || null; // null if "Unassigned"
                const originalName = editFileNameInput.defaultValue; // Get original name to check if changed

                if (!fileId) {
                    showFeedback(editFileFeedbackArea, "Error: File ID missing.", true);
                    return;
                }
                if (!newName) {
                    showFeedback(editFileFeedbackArea, "File name cannot be empty.", true);
                    return;
                }

                saveFileChangesBtn.disabled = true;
                saveFileChangesBtn.textContent = 'Saving...';
                showFeedback(editFileFeedbackArea, 'Saving changes...', false);

                try {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (!user) throw new Error("User not logged in");

                    // 1. Update file name if changed
                    if (newName !== originalName) {
                         console.log(`Updating name for file ID ${fileId} to "${newName}"`);
                         const { error: nameUpdateError } = await supabaseClient
                            .from('uploaded_files')
                            .update({ file_name: newName })
                            .eq('id', fileId);
                         if (nameUpdateError) throw new Error(`Name Update Error: ${nameUpdateError.message}`);
                    }

                    // 2. Update study set association
                    // First, delete existing association for this file (if any)
                    console.log(`Deleting existing set associations for file ID ${fileId}`);
                    const { error: deleteError } = await supabaseClient
                        .from('study_set_files')
                        .delete()
                        .eq('uploaded_file_id', fileId);
                    // Ignore error if row doesn't exist, handle others
                    if (deleteError && deleteError.code !== 'PGRST204') { 
                         throw new Error(`Association Delete Error: ${deleteError.message}`);
                    }

                    // Second, insert new association if a set was selected
                    if (newSetId) {
                        console.log(`Inserting new association for file ID ${fileId} to set ID ${newSetId}`);
                        const { error: insertError } = await supabaseClient
                            .from('study_set_files')
                            .insert({ uploaded_file_id: fileId, study_set_id: newSetId });
                         if (insertError) throw new Error(`Association Insert Error: ${insertError.message}`);
                    }

                    console.log('File details saved successfully.');
                    showFeedback(editFileFeedbackArea, 'Changes saved successfully!', false);
                    closeEditFileModal();
                    displayUploadedFiles(); // Refresh the main file list
                    // Also potentially refresh the detail view if it's visible and matches the edited file's new set
                    if (studySetDetailView.style.display === 'block' && currentViewingSetId === newSetId) {
                         fetchAndDisplayFilesInSet(currentViewingSetId);
                    }

                } catch (error) {
                    console.error("Error saving file changes:", error);
                    showFeedback(editFileFeedbackArea, `Error saving: ${error.message}`, true);
                } finally {
                    saveFileChangesBtn.disabled = false;
                    saveFileChangesBtn.textContent = 'Save Changes';
                }
            });
        }

        // --- NEW: Add File Modal Functions --- //
        async function openAddFileModal() {
            if (!addFileModal || !addFileModalListElement || !addFileModalLoadingMsg || !currentViewingSetId) {
                console.error("Add file modal elements not found or no set ID is selected.");
                showFeedback(studySetMessages, "Cannot open add file dialog: No set selected or modal elements missing.", true);
                return;
            }

            console.log("Opening add file modal for set ID:", currentViewingSetId);
            addFileModalListElement.innerHTML = ''; // Clear previous list
            addFileModalLoadingMsg.style.display = 'block';
            addFileModalLoadingMsg.textContent = 'Loading your uploaded files...';
            addFileModal.style.display = 'flex'; // Show modal
            showFeedback(addFileFeedbackArea, '', false); // Clear previous feedback

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                // Fetch all uploaded files for the user
                const { data: allFiles, error: fetchError } = await supabaseClient
                    .from('uploaded_files')
                    .select('id, file_name')
                    .eq('user_id', user.id)
                    .order('file_name', { ascending: true });

                if (fetchError) throw fetchError;

                addFileModalLoadingMsg.style.display = 'none'; // Hide loading message

                if (!allFiles || allFiles.length === 0) {
                     addFileModalListElement.innerHTML = '<p>You have no uploaded documents to add.</p>';
                     confirmAddFilesBtn.disabled = true; // Disable add button if no files
                     return;
                }

                // Populate the list with checkboxes
                allFiles.forEach(file => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${file.id}" name="fileToAdd">
                            ${escapeHTML(file.file_name)}
                        </label>
                    `;
                    addFileModalListElement.appendChild(li);
                });
                confirmAddFilesBtn.disabled = false; // Ensure button is enabled

            } catch (error) {
                console.error("Error populating add file modal:", error);
                addFileModalLoadingMsg.style.display = 'none';
                addFileModalListElement.innerHTML = '<p class="error">Error loading your files.</p>';
                 showFeedback(addFileFeedbackArea, `Error loading files: ${error.message}`, true);
                 confirmAddFilesBtn.disabled = true;
            }
        }

        function closeAddFileModal() {
            if (addFileModal) addFileModal.style.display = 'none';
            if (addFileModalListElement) addFileModalListElement.innerHTML = ''; // Clear list on close
        }

        // --- Attach Event Listeners for Add File Modal --- //
        if (addFileToSetBtn) {
            addFileToSetBtn.addEventListener('click', openAddFileModal);
        }
        closeAddFileModalBtns.forEach(btn => {
            btn.addEventListener('click', closeAddFileModal);
        });
        if (addFileModal) {
            addFileModal.addEventListener('click', (event) => {
                if (event.target === addFileModal) { // Clicked on background
                    closeAddFileModal();
                }
            });
        }
        if (confirmAddFilesBtn) {
            confirmAddFilesBtn.addEventListener('click', async () => {
                if (!currentViewingSetId) {
                    showFeedback(addFileFeedbackArea, "Error: No study set context.", true);
                    return;
                }

                const selectedCheckboxes = addFileModalListElement.querySelectorAll('input[name="fileToAdd"]:checked');
                const fileIdsToAdd = Array.from(selectedCheckboxes).map(cb => cb.value);

                if (fileIdsToAdd.length === 0) {
                    showFeedback(addFileFeedbackArea, "No files selected to add.", true);
                    return;
                }

                console.log(`Adding ${fileIdsToAdd.length} file(s) to set ID ${currentViewingSetId}`);
                confirmAddFilesBtn.disabled = true;
                confirmAddFilesBtn.textContent = 'Adding...';
                showFeedback(addFileFeedbackArea, 'Adding selected files...', false);

                const recordsToInsert = fileIdsToAdd.map(fileId => ({
                    study_set_id: currentViewingSetId,
                    uploaded_file_id: fileId
                }));

                try {
                    const { error } = await supabaseClient
                        .from('study_set_files')
                        .insert(recordsToInsert, { returning: 'minimal' }); // Don't need inserted data back

                    if (error) {
                         // Handle potential duplicate error gracefully (constraint unique_set_file)
                         if (error.code === '23505') { // PostgreSQL unique violation code
                             console.warn("Attempted to add duplicate files to the set.", error);
                             showFeedback(addFileFeedbackArea, "Some files were already in the set.", true);
                             // Still proceed to close and refresh
                         } else {
                            throw error; // Throw other errors
                         }
                    } else {
                         console.log("Files added to set successfully.");
                         showFeedback(addFileFeedbackArea, `${fileIdsToAdd.length} file(s) added successfully!`, false);
                    }

                    closeAddFileModal();
                    fetchAndDisplayFilesInSet(currentViewingSetId); // Refresh the detail view list

                } catch (err) {
                    console.error("Error adding files to set:", err);
                    showFeedback(addFileFeedbackArea, `Error adding files: ${err.message}`, true);
                } finally {
                     confirmAddFilesBtn.disabled = false;
                     confirmAddFilesBtn.textContent = 'Add Selected Files';
                }
            });
        }

        // --- RESTORED: Function to handle the actual upload process --- //
        async function uploadFiles(filesToUpload) {
            if (!filesToUpload || filesToUpload.length === 0) {
                showFeedback(uploadFeedbackArea, 'No files selected for upload.', true);
                return;
            }

            showFeedback(uploadFeedbackArea, `Initiating upload for ${filesToUpload.length} file(s)...`, false);
            if(uploadAllButton) { // Check if button exists
                uploadAllButton.disabled = true;
                uploadAllButton.textContent = 'Uploading...';
            }

            try {
                const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
                if (userError || !user) {
                    throw new Error(userError?.message || "User not logged in. Please log in again.");
                }
                const userId = user.id;

                let successCount = 0;
                let errorCount = 0;

                for (const file of filesToUpload) {
                    const fileExt = file.name.split('.').pop();
                    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                    const sanitizedBaseName = fileNameWithoutExt.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\s+/g, '_');
                    const uniqueFileName = `${Date.now()}_${sanitizedBaseName}.${fileExt}`;
                    const storagePath = `${userId}/${uniqueFileName}`;

                    console.log(`Uploading ${file.name} to ${storagePath}`);

                    try {
                        // 1. Upload to Storage
                        const { error: uploadError } = await supabaseClient.storage
                            .from('useruploads') // Ensure correct bucket name
                            .upload(storagePath, file);

                        if (uploadError) {
                            throw new Error(`Storage Upload Error: ${uploadError.message}`);
                        }
                        console.log(`Successfully uploaded ${file.name} to storage.`);

                        // 2. Insert metadata into Database
                        const { error: insertError } = await supabaseClient
                            .from('uploaded_files')
                            .insert({
                                user_id: userId,
                                file_name: file.name, 
                                storage_path: storagePath,
                                file_size: file.size,
                                mime_type: file.type
                            });

                        if (insertError) {
                            console.error(`Database Insert Error for ${file.name}, attempting cleanup:`, insertError);
                             await supabaseClient.storage.from('useruploads').remove([storagePath]);
                            throw new Error(`Database Insert Error: ${insertError.message}`);
                        }
                        console.log(`Successfully inserted metadata for ${file.name}.`);
                        successCount++;

                    } catch (fileError) {
                        console.error(`Failed to upload ${file.name}:`, fileError);
                        errorCount++;
                    }
                }

                // Final Feedback
                if (errorCount > 0) {
                    showFeedback(uploadFeedbackArea, `Upload complete. ${successCount} succeeded, ${errorCount} failed.`, true);
                } else {
                    showFeedback(uploadFeedbackArea, `Successfully uploaded ${successCount} file(s)!`, false);
                }

                // Reset UI
                selectedFilesStore = [];
                updateSelectedFilesUI();
                displayUploadedFiles(); 

            } catch (err) {
                console.error('General Upload Error:', err);
                showFeedback(uploadFeedbackArea, `Upload failed: ${err.message}`, true);
            } finally {
                if(uploadAllButton) {
                    uploadAllButton.disabled = false;
                    uploadAllButton.textContent = 'Upload All Selected';
                }
            }
        }

        // --- RESTORED: Event Listeners for File Selection and Upload --- //

        // Update UI for selected files
        function updateSelectedFilesUI() {
            if (!selectedFilesListElement || !noFilesMessage || !uploadAllButton) return;
            selectedFilesListElement.innerHTML = ''; 
            if (selectedFilesStore.length === 0) {
                noFilesMessage.style.display = 'block';
                uploadAllButton.style.display = 'none';
            } else {
                noFilesMessage.style.display = 'none';
                selectedFilesStore.forEach((file, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        ${escapeHTML(file.name)} (${formatBytes(file.size)}) 
                        <button data-index="${index}" class="remove-selected-file" aria-label="Remove ${escapeHTML(file.name)}">×</button>
                    `;
                    li.querySelector('.remove-selected-file').addEventListener('click', (e) => {
                        const indexToRemove = parseInt(e.target.getAttribute('data-index'), 10);
                        selectedFilesStore.splice(indexToRemove, 1);
                        updateSelectedFilesUI(); 
                    });
                    selectedFilesListElement.appendChild(li);
                });
                uploadAllButton.style.display = 'inline-block';
            }
        }

        // Handle newly selected files (from input or drag/drop)
        function handleNewFiles(newFiles) {
            const validFiles = Array.from(newFiles).filter(file => {
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                    showFeedback(uploadFeedbackArea || studySetMessages, `Skipping ${file.name}: Unsupported file type.`, true);
                    return false;
                }
                return true;
            });
            validFiles.forEach(vf => {
                if (!selectedFilesStore.some(sf => sf.name === vf.name && sf.size === vf.size)) {
                    selectedFilesStore.push(vf);
                }
            });
            updateSelectedFilesUI();
        }

        // Listener for file input change
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                handleNewFiles(event.target.files);
            });
        }

        // Listener for the specific "Select Files" button inside the area
        const selectFilesButton = uploadArea?.querySelector('.btn-primary');
        if (selectFilesButton && fileInput) {
            selectFilesButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                fileInput.click();
            });
        }

        // Listener for upload area click (trigger file input, excluding button)
        if (uploadArea && fileInput) {
             uploadArea.addEventListener('click', (e) => {
                 if (!e.target.closest('button')) {
                    fileInput.click();
                 }
             });
        }

        // Listeners for drag and drop
        if (uploadArea) {
             uploadArea.addEventListener('dragover', (event) => {
                 event.preventDefault();
                 uploadArea.classList.add('dragging'); 
             });
             uploadArea.addEventListener('dragleave', () => {
                 uploadArea.classList.remove('dragging');
             });
             uploadArea.addEventListener('drop', (event) => {
                 event.preventDefault();
                 uploadArea.classList.remove('dragging');
                 handleNewFiles(event.dataTransfer.files);
             });
        }

        // Listener for the main upload button ("Upload All Selected")
        if (uploadAllButton) {
            uploadAllButton.addEventListener('click', () => {
                uploadFiles(selectedFilesStore); // Assumes uploadFiles function exists
            });
        }

        // Listener for deleting/editing uploaded files (Your Uploaded Documents list)
         if (uploadedFilesListElement) {
             uploadedFilesListElement.addEventListener('click', (event) => {
                  const editButton = event.target.closest('.btn-edit-file');
                  const deleteButton = event.target.closest('.btn-delete-file');
 
                  if (deleteButton) {
                     const fileId = deleteButton.getAttribute('data-file-id');
                     const storagePath = deleteButton.getAttribute('data-storage-path');
                     console.log(`Delete button clicked. File ID: ${fileId}, Storage Path: ${storagePath}`);
                     if (fileId && storagePath) {
                         deleteFile(fileId, storagePath);
                     }
                  } else if (editButton) {
                     const fileId = editButton.getAttribute('data-file-id');
                     const currentName = editButton.getAttribute('data-file-name');
                      console.log(`Edit button clicked. File ID: ${fileId}, Current Name: ${currentName}`);
                      if (fileId && currentName) {
                         openEditFileModal(fileId, currentName);
                     }
                 }
             });
             console.log("Attached listener to uploadedFilesListElement");
         } else {
              console.error("Could not find uploadedFilesListElement to attach listener.");
         }
        // END OF RESTORED LISTENERS 

        // --- NEW: Q&A Functions --- //
        async function populateQASourceSelect() {
            if (!qaSourceSelect) return;
            console.log("Populating Q&A source select...");
            qaSourceSelect.innerHTML = '<option value="">-- Loading sources... --</option>';
            qaSourceSelect.disabled = true;
            generateQaBtn.disabled = true;

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                // Fetch files and sets concurrently
                const [filesResult, setsResult] = await Promise.all([
                    supabaseClient.from('uploaded_files').select('id, file_name').eq('user_id', user.id).order('file_name'),
                    supabaseClient.from('study_sets').select('id, name').eq('user_id', user.id).order('name')
                ]);

                const { data: files, error: filesError } = filesResult;
                const { data: sets, error: setsError } = setsResult;

                if (filesError) throw new Error(`Error fetching files: ${filesError.message}`);
                if (setsError) throw new Error(`Error fetching sets: ${setsError.message}`);

                qaSourceSelect.innerHTML = '<option value="">-- Select a Source --</option>'; // Reset placeholder

                // Add Files optgroup
                if (files && files.length > 0) {
                    const fileGroup = document.createElement('optgroup');
                    fileGroup.label = 'Uploaded Files';
                    files.forEach(file => {
                        const option = document.createElement('option');
                        option.value = `file-${file.id}`;
                        option.textContent = escapeHTML(file.file_name);
                        fileGroup.appendChild(option);
                    });
                    qaSourceSelect.appendChild(fileGroup);
                }

                // Add Study Sets optgroup
                if (sets && sets.length > 0) {
                    const setGroup = document.createElement('optgroup');
                    setGroup.label = 'Study Sets';
                    sets.forEach(set => {
                        const option = document.createElement('option');
                        option.value = `set-${set.id}`;
                        option.textContent = escapeHTML(set.name);
                        setGroup.appendChild(option);
                    });
                    qaSourceSelect.appendChild(setGroup);
                }
                
                if ((!files || files.length === 0) && (!sets || sets.length === 0)) {
                     qaSourceSelect.innerHTML = '<option value="">-- No sources available --</option>';
                } else {
                    qaSourceSelect.disabled = false;
                    generateQaBtn.disabled = false; // Enable button once options are loaded
                }

            } catch (error) {
                 console.error("Error populating Q&A source select:", error);
                 qaSourceSelect.innerHTML = '<option value="">-- Error Loading Sources --</option>';
                 showFeedback(qaFeedbackArea, `Error loading sources: ${error.message}`, true);
            }
        }

        // --- Add Event Listener for Generate Q&A Button --- //
        if (generateQaBtn) {
            generateQaBtn.addEventListener('click', async () => {
                if (!qaSourceSelect || qaSourceSelect.value === "") {
                    showFeedback(qaFeedbackArea, "Please select a source document or study set first.", true);
                    return;
                }

                const selectedValue = qaSourceSelect.value;
                const [type, id] = selectedValue.split('-'); // e.g., ["file", "uuid"] or ["set", "uuid"]

                if (!type || !id) {
                     showFeedback(qaFeedbackArea, "Invalid source selection.", true);
                     return;
                }
                
                console.log(`Generate Q&A clicked. Type: ${type}, ID: ${id}`);
                showFeedback(qaFeedbackArea, `Generating Q&A for ${type} with ID ${id}... (Not implemented yet)`, false);
                generateQaBtn.disabled = true;
                generateQaBtn.textContent = 'Generating...';
                qaOutputArea.style.display = 'none'; // Hide previous results
                
                // ** TODO: Implement API call to AI backend here ** 
                // Send the type and id (and potentially content/file references)
                // Get back Q&A pairs
                
                // Placeholder result display:
                setTimeout(() => {
                     console.log("Placeholder: Q&A generation finished.");
                     qaOutputArea.style.display = 'block'; // Show output area
                     if(qaOutputContent && noQaGeneratedMsg) {
                         qaOutputContent.innerHTML = ''; // Clear old content
                         // Example: Add fetched Q&A
                         // qaOutputContent.innerHTML = `<div>Q1: ... A1: ...</div>`;
                         noQaGeneratedMsg.textContent = 'Q&A generation complete (Placeholder).'; 
                         qaOutputContent.appendChild(noQaGeneratedMsg);
                     }
                     generateQaBtn.disabled = false;
                     generateQaBtn.textContent = 'Generate Q&A';
                     showFeedback(qaFeedbackArea, '', false); // Clear processing message
                 }, 2000); // Simulate delay
            });
        }

        // --- NEW: Solver Functions --- //
        async function populateSolverSourceSelect() {
            if (!solverSourceSelect) return;
            console.log("Populating Solver source select...");
            solverSourceSelect.innerHTML = '<option value="">-- Loading your files... --</option>';
            solverSourceSelect.disabled = true;

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                const { data: files, error: filesError } = await supabaseClient
                    .from('uploaded_files')
                    .select('id, file_name')
                    .eq('user_id', user.id)
                    .order('file_name');

                if (filesError) throw new Error(`Error fetching files: ${filesError.message}`);

                solverSourceSelect.innerHTML = '<option value="">-- Select an uploaded file --</option>'; // Reset placeholder

                if (files && files.length > 0) {
                    files.forEach(file => {
                        const option = document.createElement('option');
                        option.value = file.id; // Use file ID as value
                        option.textContent = escapeHTML(file.file_name);
                        solverSourceSelect.appendChild(option);
                    });
                     solverSourceSelect.disabled = false;
                } else {
                     solverSourceSelect.innerHTML = '<option value="">-- No files uploaded yet --</option>';
                }
            } catch (error) {
                 console.error("Error populating Solver source select:", error);
                 solverSourceSelect.innerHTML = '<option value="">-- Error Loading Files --</option>';
                 // Consider adding a dedicated feedback area for the solver section
                 // showFeedback(solverFeedbackArea, `Error loading files: ${error.message}`, true);
            }
        }

        // --- Event Listener for Solve Problem Button --- //
        if (solveProblemBtn) {
             solveProblemBtn.addEventListener('click', async () => {
                 const selectedFileId = solverSourceSelect ? solverSourceSelect.value : '';
                 const problemText = problemInput ? problemInput.value.trim() : '';

                 if (!selectedFileId && problemText === '') {
                     alert("Please select a source document or type your problem in the text box."); // Simple alert for now
                     // Or use showFeedback if a solverFeedbackArea is added
                     return;
                 }

                 // Reset output area
                 if (solverOutputPlaceholder) solverOutputPlaceholder.innerHTML = '<p>Solving...</p>';
                 if (solverOutputArea) solverOutputArea.style.display = 'block';

                 solveProblemBtn.disabled = true;
                 solveProblemBtn.textContent = 'Solving...';

                 let sourceInfo = {};
                 if (selectedFileId) {
                     const selectedFileName = solverSourceSelect.options[solverSourceSelect.selectedIndex]?.text || 'selected file';
                     console.log(`Solving problem from selected file: ID=${selectedFileId}, Name=${selectedFileName}`);
                     sourceInfo = { type: 'file', id: selectedFileId, name: selectedFileName };
                     // TODO: Implement backend call using file ID
                 } else {
                     console.log("Solving problem from text input:", problemText);
                      sourceInfo = { type: 'text', content: problemText };
                     // TODO: Implement backend call using problem text
                 }

                 // Placeholder for result
                 setTimeout(() => {
                     console.log("Placeholder: Solving finished.");
                     if (solverOutputPlaceholder) {
                        if (sourceInfo.type === 'file') {
                             solverOutputPlaceholder.innerHTML = `<p>Solution for file <strong>${escapeHTML(sourceInfo.name)}</strong> will appear here (Placeholder).</p>`;
                         } else {
                            solverOutputPlaceholder.innerHTML = `<p>Solution for your text problem will appear here (Placeholder).</p>`;
                        }
                    }
                     solveProblemBtn.disabled = false;
                     solveProblemBtn.textContent = 'Solve Problem';
                     // Clear feedback if used
                 }, 2000); // Simulate delay
             });
        }

        // --- NEW: Summary Functions --- //
        async function populateSummarySourceSelect() {
            if (!summarySourceSelect) return;
            console.log("Populating Summary source select...");
            summarySourceSelect.innerHTML = '<option value="">-- Loading sources... --</option>';
            summarySourceSelect.disabled = true;
            viewSummaryBtn.disabled = true;

            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("User not logged in");

                // Fetch files and sets concurrently (same as Q&A)
                const [filesResult, setsResult] = await Promise.all([
                    supabaseClient.from('uploaded_files').select('id, file_name').eq('user_id', user.id).order('file_name'),
                    supabaseClient.from('study_sets').select('id, name').eq('user_id', user.id).order('name')
                ]);

                const { data: files, error: filesError } = filesResult;
                const { data: sets, error: setsError } = setsResult;

                if (filesError) throw new Error(`Error fetching files: ${filesError.message}`);
                if (setsError) throw new Error(`Error fetching sets: ${setsError.message}`);

                summarySourceSelect.innerHTML = '<option value="">-- Select a Source --</option>'; // Reset placeholder

                // Add Files optgroup
                if (files && files.length > 0) {
                    const fileGroup = document.createElement('optgroup');
                    fileGroup.label = 'Uploaded Files';
                    files.forEach(file => {
                        const option = document.createElement('option');
                        option.value = `file-${file.id}`;
                        option.textContent = escapeHTML(file.file_name);
                        fileGroup.appendChild(option);
                    });
                    summarySourceSelect.appendChild(fileGroup);
                }

                // Add Study Sets optgroup
                if (sets && sets.length > 0) {
                    const setGroup = document.createElement('optgroup');
                    setGroup.label = 'Study Sets';
                    sets.forEach(set => {
                        const option = document.createElement('option');
                        option.value = `set-${set.id}`;
                        option.textContent = escapeHTML(set.name);
                        setGroup.appendChild(option);
                    });
                    summarySourceSelect.appendChild(setGroup);
                }
                
                if ((!files || files.length === 0) && (!sets || sets.length === 0)) {
                     summarySourceSelect.innerHTML = '<option value="">-- No sources available --</option>';
                } else {
                    summarySourceSelect.disabled = false;
                    viewSummaryBtn.disabled = false; // Enable button once options are loaded
                }

            } catch (error) {
                 console.error("Error populating Summary source select:", error);
                 summarySourceSelect.innerHTML = '<option value="">-- Error Loading Sources --</option>';
                 showFeedback(summaryFeedbackArea, `Error loading sources: ${error.message}`, true);
            }
        }

        // --- Add Event Listener for View Summary Button --- //
        if (viewSummaryBtn) {
            viewSummaryBtn.addEventListener('click', async () => {
                if (!summarySourceSelect || summarySourceSelect.value === "") {
                    showFeedback(summaryFeedbackArea, "Please select a source document or study set first.", true);
                    return;
                }

                const selectedValue = summarySourceSelect.value;
                const [type, id] = selectedValue.split('-'); // e.g., ["file", "uuid"] or ["set", "uuid"]
                const selectedName = summarySourceSelect.options[summarySourceSelect.selectedIndex]?.text || 'selected source';

                if (!type || !id) {
                     showFeedback(summaryFeedbackArea, "Invalid source selection.", true);
                     return;
                }
                
                console.log(`View Summary clicked. Type: ${type}, ID: ${id}, Name: ${selectedName}`);
                showFeedback(summaryFeedbackArea, `AI is analyzing '${escapeHTML(selectedName)}'... Please wait.`, false);
                viewSummaryBtn.disabled = true;
                viewSummaryBtn.textContent = 'Analyzing...';
                summaryOutputArea.style.display = 'none'; // Hide previous results
                if (summarySourceNameSpan) summarySourceNameSpan.textContent = '';

                // --- NEW: API Call to Backend --- 
                try {
                    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
                    if (sessionError || !session) {
                        throw new Error('Authentication error. Please log in again.');
                    }

                    const accessToken = session.access_token;

                    // Assume backend endpoint is /api/analyze
                    // You will need to create this backend function separately!
                    const response = await fetch('/api/analyze', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}` // Send auth token
                        },
                        body: JSON.stringify({ 
                            sourceType: type, // 'file' or 'set'
                            sourceId: id      // UUID of the file or set
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: response.statusText })); // Try to get error message
                        throw new Error(`Analysis failed: ${errorData.message || response.status}`);
                    }

                    const result = await response.json(); // Expect { summary: "...", insights: ["...", "..."] }

                    console.log("AI Analysis successful:", result);

                    // Display results
                    summaryOutputArea.style.display = 'block';
                    if (summarySourceNameSpan) summarySourceNameSpan.textContent = `for ${escapeHTML(selectedName)}`;
                    if (summaryContentDiv) {
                        summaryContentDiv.innerHTML = ''; // Clear loading/previous
                        
                        // Simple formatting - you can enhance this significantly
                        const summaryHTML = `<h4>Summary:</h4><p>${escapeHTML(result.summary || 'No summary provided.')}</p>`;
                        const insightsHTML = `<h4>Key Insights:</h4><ul>${(result.insights || ['No insights provided.']).map(insight => `<li>${escapeHTML(insight)}</li>`).join('')}</ul>`;
                        
                        summaryContentDiv.innerHTML = summaryHTML + insightsHTML;
                    }
                    showFeedback(summaryFeedbackArea, '', false); // Clear processing message

                } catch (error) {
                    console.error("Error during AI analysis:", error);
                    showFeedback(summaryFeedbackArea, `Error: ${error.message}`, true);
                    summaryOutputArea.style.display = 'none'; // Hide output area on error

                } finally {
                    viewSummaryBtn.disabled = false;
                    viewSummaryBtn.textContent = 'Analyze & Summarize';
                }
                // --- END NEW: API Call --- 
            });
        }

        // --- Initialization & Event Listeners --- //
        function initializeDashboard() {
            console.log('Initializing dashboard...');
            personalizeGreeting();

            // Initial section activation based on hash or default
            const initialHash = window.location.hash.substring(1);
            const initialSectionId = initialHash || sidebarLinks[0]?.getAttribute('href')?.substring(1) || 'upload';
            if (initialSectionId) {
                activateSection(initialSectionId);
            } else {
                console.error("Could not determine initial section.");
                if(dashboardSections.length > 0) dashboardSections[0].style.display = 'block';
            }

            // Sidebar link click listeners
            sidebarLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    // Let browser handle hash change, rely on popstate listener
                    // event.preventDefault(); // Ensure this is REMOVED or commented out
                    const targetId = link.getAttribute('href')?.substring(1);
                    console.log('Sidebar link clicked, letting browser handle hash. Target ID:', targetId);

                    // Close sidebar on mobile after click
                     if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                         sidebar.classList.remove('active');
                     }
                });
            });
            console.log('Finished attaching sidebar link click listeners.');

            // Diagnostic listener on UL (Optional, can be removed if popstate works)
            const sidebarNavUL = sidebarNav?.querySelector('ul');
            if (sidebarNavUL) {
                sidebarNavUL.addEventListener('click', (event) => {
                    console.log('!!!! Click detected on sidebar UL. Target:', event.target);
                    if (event.target.closest('a[href^="#"]')) {
                        console.log('!!!! Click target was inside a navigation link.');
                    } else {
                        console.log('!!!! Click target was NOT inside a navigation link.');
                    }
                });
                 console.log('Attached diagnostic click listener to sidebar UL.');
            } else {
                 console.log('Could not find sidebar UL to attach diagnostic listener.');
            }

            // Handle back/forward and link clicks via hash changes
             window.addEventListener('popstate', () => {
                 console.log('Popstate event fired!'); // <-- Log
                 const currentHash = window.location.hash.substring(1);
                 const targetId = currentHash || sidebarLinks[0]?.getAttribute('href')?.substring(1) || 'upload';
                 console.log('Popstate detected target ID:', targetId); // <-- Log
                 activateSection(targetId);
             });

             // --- Listener for actions within the detail view file list --- //
             if (detailSetFilesListElement) {
                 detailSetFilesListElement.addEventListener('click', (event) => {
                     // Use closest() for more robust button detection
                     const removeButton = event.target.closest('.btn-remove-from-set'); 
                     if (removeButton) {
                         const associationId = removeButton.getAttribute('data-association-id');
                         console.log(`Remove from set button clicked via closest(). Association ID: ${associationId}`);
                         if (associationId) {
                             handleRemoveFileFromSet(associationId);
                         }
                     }
                 });
                 console.log("Attached listener to detailSetFilesListElement"); // Verify listener attachment
             } else {
                 console.error("Could not find detailSetFilesListElement to attach listener.");
             }

            // Initial UI updates
            updateSelectedFilesUI();

            console.log('Dashboard initialized.');
        }

        // Run Initialization
        initializeDashboard();

    } // End of isDashboardPage check

    // --- Logout Logic (remains the same) --- //
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