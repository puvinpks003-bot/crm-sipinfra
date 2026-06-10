from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.fill('#login-email', 'caller@sipinfra.in')
    page.fill('#login-password', 'demo1234')
    page.click('#login-btn')
    page.wait_for_timeout(1500)
    
    # Check if app is visible
    app_visible = page.is_visible('#app-screen')
    print('App Visible:', app_visible)
    
    # Check for console errors
    # Wait, we can't easily capture console this way, but let's see if login works.
