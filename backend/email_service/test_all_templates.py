import sys
import time
from datetime import datetime
from email_sender import send_email

# Test recipient email
TEST_EMAIL = "saadzaidi129@gmail.com"

def test_welcome_email():
    """Test welcome email template"""
    print("\n🧪 Testing: Welcome Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Welcome to CrowdFundPK!",
            template_name="welcome.html",
            username="Saad Zaidi"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_campaign_approved_email():
    """Test campaign approved email template"""
    print("\n🧪 Testing: Campaign Approved Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Your Campaign Has Been Approved!",
            template_name="campaign_approved.html",
            username="Saad Zaidi",
            campaign_name="Help Build Schools in Rural Areas",
            campaign_link="https://crowdfundpk.com/campaign/123",
            platform_name="CrowdFundPK"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_campaign_rejected_email():
    """Test campaign rejected email template"""
    print("\n🧪 Testing: Campaign Rejected Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Campaign Review Update",
            template_name="campaign_rejected.html",
            username="Saad Zaidi",
            campaign_name="Help Build Schools in Rural Areas",
            reason="The campaign description needs more details about fund allocation and timeline.",
            support_email="support@crowdfundpk.com"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_donation_success_email():
    """Test donation success email template"""
    print("\n🧪 Testing: Donation Success Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Thank You for Your Donation!",
            template_name="donation_success.html",
            username="Saad Zaidi",
            campaign_name="Help Build Schools in Rural Areas",
            donation_amount="5,000",
            payment_method="JazzCash",
            payment_time=datetime.now().strftime("%B %d, %Y at %I:%M %p")
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_forgot_password_email():
    """Test forgot password email template"""
    print("\n🧪 Testing: Forgot Password Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Reset Your CrowdFundPK Password",
            template_name="forgot_password.html",
            username="Saad Zaidi",
            reset_link="https://crowdfundpk.com/reset-password?token=abc123xyz456"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_password_changed_email():
    """Test password changed email template"""
    print("\n🧪 Testing: Password Changed Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Your Password Has Been Changed",
            template_name="password_changed.html",
            username="Saad Zaidi",
            date=datetime.now().strftime("%B %d, %Y at %I:%M %p"),
            reset_link="https://crowdfundpk.com/reset-password"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def test_transaction_failed_email():
    """Test transaction failed email template"""
    print("\n🧪 Testing: Transaction Failed Email")
    try:
        result = send_email(
            receiver_email=TEST_EMAIL,
            subject="Transaction Failed - CrowdFundPK",
            template_name="transaction_failed.html",
            username="Saad Zaidi",
            amount="Rs. 5,000",
            campaign_name="Help Build Schools in Rural Areas",
            retry_link="https://crowdfundpk.com/campaign/123/donate"
        )
        print(f"✅ Success: {result['message']}")
        return True
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        return False

def run_all_tests(delay=3):
    """Run all email tests with optional delay between sends"""
    print("="*60)
    print("📧 CrowdFundPK Email Template Test Suite")
    print("="*60)
    print(f"Test recipient: {TEST_EMAIL}")
    print(f"Delay between tests: {delay} seconds")
    
    tests = [
        test_welcome_email,
        test_campaign_approved_email,
        test_campaign_rejected_email,
        test_donation_success_email,
        test_forgot_password_email,
        test_password_changed_email,
        test_transaction_failed_email
    ]
    
    results = []
    for i, test in enumerate(tests):
        results.append(test())
        
        # Add delay between tests (except after last test)
        if i < len(tests) - 1:
            print(f"\n⏳ Waiting {delay} seconds before next test...")
            time.sleep(delay)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed successfully!")
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")
    
    return passed == total

if __name__ == "__main__":
    # You can adjust the delay between email sends (in seconds)
    # to avoid rate limiting
    success = run_all_tests(delay=3)
    sys.exit(0 if success else 1)