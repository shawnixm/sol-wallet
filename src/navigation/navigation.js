export function initializeNavigation() {
    document.addEventListener('DOMContentLoaded', () => {
        // Complete Page Elements
        const main_page = document.getElementById('main_page')
        const recieve_page = document.getElementById('recieve_page')
        const send_page = document.getElementById('send_page')
        const settings_page = document.getElementById('settings_page')

        // Navigation Button Elements
        const go_recieve_page = document.getElementById('go_recieve_page')
        const go_send_page = document.getElementById('go_send_page')
        const go_settings_page = document.getElementById('go_settings_page')
        
        const close_recieve_page = document.getElementById('close_recieve_page')
        const close_send_page = document.getElementById('close_send_page')
        const close_settings_page = document.getElementById('close_settings_page')

        // Navigation Button Functions
        go_recieve_page.addEventListener('click', function() {
        main_page.style.display = 'none'
        recieve_page.style.display = 'flex'
        })
        go_send_page.addEventListener('click', function() {
            main_page.style.display = 'none'
            send_page.style.display = 'flex'
        })
        go_settings_page.addEventListener('click', function() {
            main_page.style.display = 'none'
            settings_page.style.display = 'flex'
        })

        close_recieve_page.addEventListener('click', function() {
            recieve_page.style.display = 'none'
            main_page.style.display = 'block'
        })
        close_send_page.addEventListener('click', function() {
            send_page.style.display = 'none'
            main_page.style.display = 'block'
        })
        close_settings_page.addEventListener('click', function() {
            settings_page.style.display = 'none'
            main_page.style.display = 'block'
        })
    })
}