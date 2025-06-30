// Navigation scroll effect
const nav = document.querySelector('.nav') as HTMLElement;
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(this: HTMLAnchorElement, e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Handle mobile navigation toggle
const createMobileNav = () => {
    const nav = document.querySelector('.nav-container');
    if (!nav) return;

    const mobileNavButton = document.createElement('button');
    mobileNavButton.className = 'mobile-nav-button';
    mobileNavButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.add('mobile-nav-links');
        nav.insertBefore(mobileNavButton, navLinks);

        mobileNavButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileNavButton.classList.toggle('active');
        });
    }
};

// Initialize mobile navigation
createMobileNav();

// Add scroll event listener for nav background
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (nav) {
        if (window.scrollY > 0) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
});

// Modal functionality
const modal = document.getElementById('signupModal');
const getStartedButtons = document.querySelectorAll('.btn-primary');
const closeModal = document.querySelector('.close-modal');

// Open modal
getStartedButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Close modal when clicking outside
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Handle auth tabs
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    function switchTab(tabName: string) {
        // Remove active class from all tabs and forms
        tabButtons.forEach(btn => btn.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));
        
        // Add active class to selected tab and form
        const selectedTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const selectedForm = document.getElementById(`${tabName}Form`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedForm) selectedForm.classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        });
    });
});

// Account type selection modal
function showAccountTypeModal() {
    const modalHTML = `
        <div id="accountTypeModal" class="modal active" style="z-index: 1000;">
            <div class="modal-content" style="max-width: 800px; padding: 0;">
                <div class="modal-header">
                    <h2>Choose Your Account Type</h2>
                    <p style="color: var(--text-light); margin-top: 0.5rem;">Select the type of account that best describes your role</p>
                </div>
                <div class="account-type-options" style="display: grid; gap: 2rem; margin: 3rem; padding: 0 1rem;">
                    <div class="account-type-option" data-type="owner" style="
                        padding: 2rem;
                        border: 2px solid rgba(0, 102, 68, 0.3);
                        border-radius: 1.5rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: linear-gradient(135deg, rgba(0, 102, 68, 0.05), rgba(0, 102, 68, 0.1));
                        margin: 0 1rem;
                    ">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="
                                width: 60px;
                                height: 60px;
                                background: linear-gradient(45deg, var(--primary-color), var(--primary-light));
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 2rem;
                                color: white;
                            ">🏢</div>
                            <div>
                                <h3 style="margin: 0; color: var(--text-primary); font-size: 1.5rem;">Owner</h3>
                                <p style="margin: 0.5rem 0 0 0; color: var(--text-light); font-size: 1rem; line-height: 1.5;">
                                    Create and manage referral campaigns for your business. Perfect for entrepreneurs, startups, and established companies looking to grow through referrals.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="account-type-option" data-type="referrer" style="
                        padding: 2rem;
                        border: 2px solid rgba(0, 102, 68, 0.3);
                        border-radius: 1.5rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: linear-gradient(135deg, rgba(0, 102, 68, 0.05), rgba(0, 102, 68, 0.1));
                        margin: 0 1rem;
                    ">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="
                                width: 60px;
                                height: 60px;
                                background: linear-gradient(45deg, var(--primary-color), var(--primary-light));
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 2rem;
                                color: white;
                            ">👥</div>
                            <div>
                                <h3 style="margin: 0; color: var(--text-primary); font-size: 1.5rem;">Affiliate</h3>
                                <p style="margin: 0.5rem 0 0 0; color: var(--text-light); font-size: 1rem; line-height: 1.5;">
                                    Join existing referral campaigns and earn rewards for successful referrals. Perfect for influencers, content creators, and anyone looking to earn through referrals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; padding: 2rem; border-top: 1px solid rgba(0, 102, 68, 0.2);">
                    <p style="color: var(--text-light); margin: 0;">You can change your account type later in your profile settings</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners for account type selection
    const accountTypeOptions = document.querySelectorAll('.account-type-option');
    accountTypeOptions.forEach(option => {
        option.addEventListener('mouseenter', function(this: HTMLElement) {
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'linear-gradient(135deg, rgba(0, 102, 68, 0.1), rgba(0, 102, 68, 0.2))';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 102, 68, 0.3)';
        });

        option.addEventListener('mouseleave', function(this: HTMLElement) {
            this.style.borderColor = 'rgba(0, 102, 68, 0.3)';
            this.style.background = 'linear-gradient(135deg, rgba(0, 102, 68, 0.05), rgba(0, 102, 68, 0.1))';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        option.addEventListener('click', async function(this: HTMLElement) {
            const accountType = this.getAttribute('data-type');
            if (accountType) {
                await selectAccountType(accountType);
            }
        });
    });
}

async function selectAccountType(accountType: string) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) return;

    // Update user data with account type
    user.accountType = accountType;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('isNewUser');

    // Store account type mapping for this email (local backup)
    const accountTypes = JSON.parse(localStorage.getItem('userAccountTypes') || '{}');
    accountTypes[user.email] = accountType;
    localStorage.setItem('userAccountTypes', JSON.stringify(accountTypes));

    // Store account type in database via API
    try {
        const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/storeaccounttype', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.email, accountType })
        });
        
        if (!response.ok) {
            console.error('Failed to store account type in database');
        } else {
            console.log('Account type stored in database successfully');
        }
    } catch (error) {
        console.error('Error storing account type:', error);
    }
    
    // Remove the modal
    const modal = document.getElementById('accountTypeModal');
    if (modal) {
        modal.remove();
    }

    // Redirect based on account type
    redirectBasedOnAccountType(accountType);
}

// Redirect based on account type
function redirectBasedOnAccountType(accountType: string) {
    switch (accountType) {
        case 'owner':
            window.location.href = 'home.html';
            break;
        case 'referrer':
            window.location.href = 'referrer-dashboard.html';
            break;
        default:
            window.location.href = 'home.html';
    }
}

// Handle login/signup form submissions
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm') as HTMLFormElement;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;

    async function handleAuth(form: HTMLFormElement, mode: 'login' | 'signup') {
        const formData = new FormData(form);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        let endpoint = '';
        if (mode === 'login') {
            endpoint = 'https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/signin';
        } else if (mode === 'signup') {
            endpoint = 'https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/signup';
        } else {
            alert('Invalid mode');
            return;
        }
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, email, password })
            });
            const data = await response.json();
            
            if (mode === 'signup') {
                // For signup, check statusCode
                if (response.ok && (data.statusCode === 200 || data.statusCode === 201)) {
                    const userData: { email: string; accountType?: string } = { email };
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('isNewUser', 'true'); // Mark as new user
                    showAccountTypeModal();
                } else {
                    alert(data.message || 'Signup failed');
                }
            } else {
                // For login, check if we got user data back (successful login)
                if (response.ok && data.username && data.email) {
                    console.log('Login successful, server response:', data);
                    
                    // Try to get account type from loadaccounttype endpoint
                    let accountType = null;
                    try {
                        const accountTypeResponse = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/loadaccounttype', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: data.email })
                        });
                        
                        if (accountTypeResponse.ok) {
                            const accountTypeData = await accountTypeResponse.json();
                            accountType = accountTypeData.accountType;
                            console.log('Account type loaded from database:', accountType);
                        } else {
                            console.log('No account type found in database');
                        }
                    } catch (error) {
                        console.error('Error loading account type:', error);
                    }
                    
                    // If not found in database, check stored account types by email as fallback
                    if (!accountType) {
                        const accountTypes = JSON.parse(localStorage.getItem('userAccountTypes') || '{}');
                        accountType = accountTypes[data.email];
                        console.log('Account type from stored mapping:', accountType);
                    }
                    
                    // If still not found, check localStorage as final fallback
                    if (!accountType) {
                        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                        accountType = existingUser.accountType;
                        console.log('Account type from localStorage:', accountType);
                    }
                    
                    const userData: { email: string; accountType?: string } = { email: data.email };
                    
                    if (accountType) {
                        userData.accountType = accountType;
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.removeItem('isNewUser'); // Remove new user flag
                        console.log('Redirecting to dashboard for account type:', accountType);
                        
                        // Load campaigns immediately after successful login for owners
                        if (accountType === 'owner') {
                            // Small delay to ensure the page loads before calling the campaigns API
                            setTimeout(() => {
                                loadCampaignsAfterLogin(data.email);
                            }, 500);
                        }
                        
                        redirectBasedOnAccountType(accountType);
                    } else {
                        // If still no account type, user needs to select one
                        console.log('No account type found, showing account type modal');
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('isNewUser', 'true'); // Mark as needing account type
                        showAccountTypeModal();
                    }
                } else {
                    console.log('Login failed, server response:', data);
                    alert(data.message || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Connection error. Please try again.');
        }
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth(signupForm, 'signup');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth(loginForm, 'login');
        });
    }
});

// Handle logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
});

// Campaigns functionality
document.addEventListener('DOMContentLoaded', () => {
    const createCampaignBtn = document.getElementById('createCampaignBtn');
    const createCampaignModal = document.getElementById('createCampaignModal');
    const closeModal = document.querySelector('.close-modal');
    const createCampaignForm = document.getElementById('createCampaignForm') as HTMLFormElement;

    // Only check login status on pages that require authentication
    const currentPage = window.location.pathname;
    const requiresAuth = currentPage.includes('campaigns.html') || currentPage.includes('home.html') || currentPage.includes('referrer-dashboard.html');
    
    if (requiresAuth) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email) {
            window.location.href = 'signup.html';
            return;
        }
    }

    // Load campaigns data
    async function loadCampaigns() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('loadCampaigns: Current user:', user);
        if (!user.email) {
            console.log('loadCampaigns: No user email found');
            return [];
        }
        try {
            console.log('loadCampaigns: Fetching campaigns for user:', user.email);
            const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/loadcampaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.email })
            });
            const data = await response.json();
            console.log('loadCampaigns: Response data:', data);
            
            if (response.ok && data.statusCode === 200) {
                const campaigns = JSON.parse(data.body);
                console.log('loadCampaigns: Parsed campaigns:', campaigns);
                return campaigns;
            } else if (Array.isArray(data)) {
                console.log('loadCampaigns: Direct array response:', data);
                return data;
            } else {
                console.log('loadCampaigns: No valid data found, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            return [];
        }
    }

    // Get owned campaigns for current user
    function getOwnedCampaigns(campaigns: any[], userEmail: string) {
        return campaigns.filter(c => c.owner === userEmail);
    }

    // Calculate total referrals for a campaign
    function calculateTotalReferrals(campaign: any) {
        let total = 0;
        campaign.referrals.forEach((referral: any) => {
            total += referral.referees.length;
        });
        return total;
    }

    // Render campaign card for owned campaigns
    function renderOwnedCampaignCard(campaign: any) {
        // Safely handle missing referrals and totalSignups fields
        const referrals = campaign.referrals || [];
        const totalSignups = campaign.totalSignups || 0;
        const participants = campaign.participants || [];
        
        // Calculate total and completed referrals
        const totalReferrals = referrals.reduce((sum: number, ref: any) => sum + (ref.referees ? ref.referees.length : 0), 0);
        const completedReferrals = referrals.reduce((sum: number, ref: any) => sum + (ref.referees ? ref.referees.filter((r: any) => r.status === 'completed').length : 0), 0);

        return `
            <div class="campaign-card" style="
                background: linear-gradient(135deg, var(--background-light), var(--primary-color));
                border-radius: 1rem;
                box-shadow: 0 0 30px rgba(0, 102, 68, 0.2);
                padding: 2rem;
                border: 1px solid rgba(0, 102, 68, 0.3);
                margin: 1rem 0;
                transition: all 0.3s ease;
                position: relative;
            ">
                <div class="campaign-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h3 class="campaign-title" style="
                            font-size: 1.5rem;
                            font-weight: 700;
                            background: linear-gradient(45deg, var(--primary-color), var(--primary-light));
                            -webkit-background-clip: text;
                            background-clip: text;
                            color: transparent;
                            margin-bottom: 0.25rem;
                        ">${campaign.name}</h3>
                        <span class="campaign-status ${campaign.status}" style="
                            padding: 0.25rem 0.75rem;
                            border-radius: 1rem;
                            font-size: 0.875rem;
                            font-weight: 500;
                            background: rgba(0,255,0,0.12);
                            color: #00ff9d;
                            text-shadow: 0 0 8px var(--primary-glow);
                        ">${campaign.status}</span>
                    </div>
                </div>
                <p class="campaign-description" style="color: var(--text-light); margin-bottom: 1.5rem; line-height: 1.6;">
                    ${campaign.description}
                </p>
                <div class="campaign-details" style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">Reward</span>
                        <span class="campaign-detail-value">${campaign.reward}</span>
                    </div>
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">Total Signups</span>
                        <span class="campaign-detail-value">${totalSignups}</span>
                    </div>
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">Total Referrals</span>
                        <span class="campaign-detail-value">${totalReferrals}</span>
                    </div>
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">Completed</span>
                        <span class="campaign-detail-value">${completedReferrals}</span>
                    </div>
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">End Date</span>
                        <span class="campaign-detail-value">${new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                    <div class="campaign-detail">
                        <span class="campaign-detail-label">Participants</span>
                        <span class="campaign-detail-value">${participants.length}</span>
                    </div>
                </div>
                <div class="campaign-actions" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <button class="btn btn-secondary" onclick="copyReferralLink('${campaign.referralLink}')">Copy Referral Link</button>
                    <a href="${campaign.referralLink}" target="_blank" class="btn btn-primary">Visit Signup Page</a>
                    <button class="btn btn-danger" onclick="deleteCampaign('${campaign.id}', '${campaign.name}')" style="background: #ff4757; border: 1px solid #ff3742;">Delete Campaign</button>
                </div>
                <div class="campaign-referral-link" style="
                    margin-top: 1rem;
                    padding: 1rem;
                    background: linear-gradient(90deg, rgba(0,255,157,0.08), rgba(0,77,51,0.12));
                    border-radius: 0.5rem;
                    font-size: 0.95rem;
                    color: var(--primary-color);
                    word-break: break-all;
                    box-shadow: 0 0 10px 0 var(--primary-glow);
                ">
                    <strong>Referral Link:</strong>
                    <div style="margin-top: 0.5rem;">
                        ${campaign.referralLink}
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize campaigns page
    async function initCampaigns() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email) {
            console.log('No user email found, cannot load campaigns');
            return;
        }
        
        console.log('Loading campaigns for user:', user.email);
        console.log('User object:', user);
        const campaigns = await loadCampaigns();
        console.log('All campaigns loaded:', campaigns);
        
        const ownedCampaigns = getOwnedCampaigns(campaigns, user.email);
        console.log('Owned campaigns for', user.email, ':', ownedCampaigns);
        
        const ownedGrid = document.getElementById('ownedCampaigns');
        
        if (ownedGrid) {
            if (ownedCampaigns.length > 0) {
                ownedGrid.innerHTML = ownedCampaigns.map(c => renderOwnedCampaignCard(c)).join('');
            } else {
                ownedGrid.innerHTML = `
                    <div style="text-align: center; color: var(--text-light); padding: 3rem;">
                        <h3>No campaigns yet</h3>
                        <p>Create your first referral campaign to start growing your business!</p>
                        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="document.getElementById('createCampaignBtn').click()">
                            Create Your First Campaign
                        </button>
                    </div>
                `;
            }
        }
    }

    // Handle create campaign modal
    if (createCampaignBtn && createCampaignModal) {
        createCampaignBtn.addEventListener('click', () => {
            // Set end date to today by default
            const endDateInput = document.getElementById('campaign-end-date') as HTMLInputElement;
            if (endDateInput) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                endDateInput.value = `${yyyy}-${mm}-${dd}`;
            }
            createCampaignModal.classList.add('active');
        });
    }

    if (closeModal && createCampaignModal) {
        closeModal.addEventListener('click', () => {
            createCampaignModal.classList.remove('active');
        });
    }

    // Handle create campaign form
    if (createCampaignForm) {
        createCampaignForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.email) return;
            const formData = new FormData(createCampaignForm);
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const reward = formData.get('reward') as string;
            const referralLinkRaw = formData.get('referralLink') as string;
            const referralLink = /^(https?:)?\/\//.test(referralLinkRaw)
                ? referralLinkRaw
                : `https://${referralLinkRaw}`;
            const endDate = formData.get('endDate') as string;
            const newCampaign = {
                id: 'temp_' + Date.now(),
                name,
                description,
                owner: user.email,
                reward,
                status: 'active',
                referralLink,
                participants: [],
                referrals: [],
                totalSignups: 0,
                created: new Date().toISOString().slice(0, 10),
                endDate
            };
            try {
                const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/storecampaigns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.email, campaign: newCampaign })
                });
                const data = await response.json();
                if (response.ok && data.statusCode === 200) {
                    if (createCampaignModal) {
                        createCampaignModal.classList.remove('active');
                    }
                    createCampaignForm.reset();
                    await initCampaigns();
                } else {
                    alert(data.message || 'Failed to create campaign');
                }
            } catch (error) {
                console.error('Error creating campaign:', error);
                alert('Connection error. Please try again.');
            }
        });
    }

    // Initialize campaigns if on campaigns page
    if (window.location.pathname.includes('campaigns.html') || window.location.pathname.includes('/campaigns')) {
        console.log('Detected campaigns page, initializing campaigns...');
        console.log('Current pathname:', window.location.pathname);
        initCampaigns();
        // Make initCampaigns globally available for refreshing after deletions
        (window as any).initCampaigns = initCampaigns;
    }
});

// Global function to copy referral link
function copyReferralLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Referral link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Referral link copied to clipboard!');
    });
}

// Global function to delete campaign (for owners)
async function deleteCampaign(campaignId: string, campaignName: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete the campaign "${campaignName}"?\n\nThis action cannot be undone and will remove all associated data.`)) {
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
        alert('Please log in to delete campaigns');
        return;
    }

    try {
        const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/deletecampaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.email, campaignId: campaignId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Campaign "${campaignName}" deleted successfully!`);
            // Reload campaigns page if we're on the campaigns page
            if (window.location.pathname.includes('campaigns.html') || window.location.pathname.includes('/campaigns')) {
                const initCampaigns = (window as any).initCampaigns;
                if (typeof initCampaigns === 'function') {
                    await initCampaigns();
                } else {
                    window.location.reload();
                }
            }
        } else {
            alert('Failed to delete campaign: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Error deleting campaign. Please try again.');
    }
}

// Pricing toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const pricingGrids = document.querySelectorAll('.pricing-grid');

    function switchPricing(accountType: string) {
        // Remove active class from all toggle buttons and pricing grids
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        pricingGrids.forEach(grid => grid.classList.remove('active'));
        
        // Add active class to selected toggle button and pricing grid
        const selectedToggle = document.querySelector(`.toggle-btn[data-type="${accountType}"]`);
        const selectedGrid = document.getElementById(`${accountType}-pricing`);
        
        if (selectedToggle) selectedToggle.classList.add('active');
        if (selectedGrid) selectedGrid.classList.add('active');
    }

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accountType = button.getAttribute('data-type');
            if (accountType) {
                switchPricing(accountType);
            }
        });
    });
});

// Load campaigns immediately after login for owners
async function loadCampaignsAfterLogin(userEmail: string) {
    try {
        const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/loadcampaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userEmail })
        });
        const data = await response.json();
        let campaigns = [];
        
        if (response.ok && data.statusCode === 200) {
            campaigns = JSON.parse(data.body);
        } else if (Array.isArray(data)) {
            campaigns = data;
        }
        
        // Filter campaigns owned by this user
        const ownedCampaigns = campaigns.filter((c: any) => c.owner === userEmail);
        
        // Update stats based on actual campaigns - safely handle missing fields
        const totalCampaigns = ownedCampaigns.length;
        const totalReferrals = ownedCampaigns.reduce((sum: number, campaign: any) => {
            const referrals = campaign.referrals || [];
            return sum + referrals.reduce((refSum: number, ref: any) => refSum + (ref.referees ? ref.referees.length : 0), 0);
        }, 0);
        
        // Store updated stats for immediate display on dashboard
        const stats = {
            totalCampaigns,
            totalReferrals,
            totalRevenue: totalReferrals * 10 // Assuming $10 per referral for now
        };
        localStorage.setItem('ownerStats', JSON.stringify(stats));
        console.log('Campaigns loaded after login:', { totalCampaigns, totalReferrals });
        
    } catch (error) {
        console.error('Error loading campaigns after login:', error);
    }
}

// Load all active campaigns for affiliates
async function loadAllActiveCampaigns(): Promise<any[]> {
    try {
        const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/loadallcampaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // No specific user needed, we want all campaigns
        });
        
        let campaigns = [];
        const data = await response.json();
        
        if (response.ok && data.statusCode === 200) {
            campaigns = JSON.parse(data.body);
        } else if (Array.isArray(data)) {
            campaigns = data;
        }
        
        console.log('All active campaigns loaded:', campaigns);
        return campaigns;
        
    } catch (error) {
        console.error('Error loading all campaigns:', error);
        return [];
    }
}

// Function to join a campaign (for affiliates)
async function joinCampaign(campaignId: string, campaignName: string): Promise<void> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
        alert('Please log in to join campaigns');
        return;
    }

    // Check if already joined locally first (quick check)
    const joinedCampaigns = JSON.parse(localStorage.getItem('joinedCampaigns') || '[]');
    if (joinedCampaigns.find((c: any) => c.campaignId === campaignId)) {
        alert('You are already part of this campaign!');
        return;
    }

    try {
        // Generate unique referral code
        const referralCode = generateReferralCode();
        
        // Get the original campaign link from all campaigns
        let allCampaigns: any[] = [];
        try {
            allCampaigns = await loadAllActiveCampaigns();
            // Ensure we have an array
            if (!Array.isArray(allCampaigns)) {
                allCampaigns = [];
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            allCampaigns = [];
        }
        
        const campaign = allCampaigns.find((c: any) => c.id === campaignId);
        
        if (!campaign) {
            alert('Campaign not found. Please refresh the page and try again.');
            return;
        }

        console.log('Joining campaign with data:', {
            username: user.email,
            campaignId,
            campaignName,
            referralCode,
            originalLink: campaign.referralLink
        });

        // Use the new joincampaign API that updates both affiliate and campaign owner data
        const response = await fetch('https://k32b4ntjrd.execute-api.us-west-2.amazonaws.com/joincampaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: user.email,
                campaignId: campaignId,
                campaignName: campaignName,
                referralCode: referralCode,
                originalLink: campaign.referralLink
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Successfully joined campaign:', data);
            
            // Update local storage for immediate UI feedback
            const updatedJoinedCampaigns = [...joinedCampaigns, {
                campaignId: campaignId,
                campaignName: campaignName,
                referralCode: referralCode,
                referralLink: data.referralLink,
                joinedDate: new Date().toISOString()
            }];
            localStorage.setItem('joinedCampaigns', JSON.stringify(updatedJoinedCampaigns));
            
            // Update stats
            const stats = JSON.parse(localStorage.getItem('referrerStats') || '{}');
            stats.activeCampaigns = updatedJoinedCampaigns.length;
            localStorage.setItem('referrerStats', JSON.stringify(stats));
            
            // Show success message with referral link
            alert(`Successfully joined campaign: ${campaignName}\n\nYour referral link: ${data.referralLink}\n\nShare this link to earn rewards!\n\nNote: The campaign owner's participant count has been updated.`);
            
            // Reload dashboard data if on referrer dashboard
            if (window.location.pathname.includes('referrer-dashboard.html')) {
                (window as any).loadDashboardData?.();
            }
        } else {
            console.error('Failed to join campaign:', data);
            alert('Failed to join campaign: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error joining campaign:', error);
        alert('Error joining campaign. Please try again.');
    }
}

// Helper function to generate referral codes
function generateReferralCode(): string {
    // Generate a unique 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to view campaign details
function viewCampaignDetails(campaignId: string): void {
    // For now, just show an alert - in a real app this would open a detailed modal or navigate to a details page
    alert(`Campaign details for ID: ${campaignId}\n\nThis feature will show detailed campaign information, terms, and conditions.`);
}

// Make functions available globally for HTML onclick handlers
(window as any).joinCampaign = joinCampaign;
(window as any).viewCampaignDetails = viewCampaignDetails;
(window as any).loadAllActiveCampaigns = loadAllActiveCampaigns;
(window as any).deleteCampaign = deleteCampaign; 