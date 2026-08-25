package com.lifeledger.util;

import com.lifeledger.entity.*;
import com.lifeledger.repository.*;
import com.lifeledger.service.EncryptionService;
import com.lifeledger.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FolderRepository folderRepository;
    private final TagRepository tagRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final NomineeRepository nomineeRepository;
    private final PolicyRepository policyRepository;
    private final PolicyDocumentRepository policyDocumentRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final EncryptionService encryptionService;
    private final StorageService storageService;

    @Override
    public void run(String... args) {
        seedCategories();
        seedUsersAndVault();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;

        List<Category> categories = List.of(
                Category.builder().name("Identity").description("Passports, National IDs, Driver Licenses, Social Security").icon("UserCheck").system(true).build(),
                Category.builder().name("Financial").description("Bank accounts, Investments, Tax filings, Credit records").icon("DollarSign").system(true).build(),
                Category.builder().name("Medical").description("Health records, Prescriptions, Vaccination cards, Allergies").icon("HeartPulse").system(true).build(),
                Category.builder().name("Legal").description("Wills, Power of Attorney, Contracts, Affidavits").icon("Scale").system(true).build(),
                Category.builder().name("Insurance").description("Health, Life, Vehicle, Home, Travel policies").icon("Shield").system(true).build(),
                Category.builder().name("Education").description("Degrees, Diplomas, Transcripts, Certifications").icon("GraduationCap").system(true).build(),
                Category.builder().name("Property").description("House deeds, Title certificates, Lease agreements").icon("Home").system(true).build(),
                Category.builder().name("Employment").description("Offer letters, Pay slips, Relieving letters, Contracts").icon("Briefcase").system(true).build(),
                Category.builder().name("Personal").description("Family documents, Personal letters, Notes").icon("User").system(true).build(),
                Category.builder().name("Other").description("Miscellaneous important documents").icon("Folder").system(true).build()
        );

        categoryRepository.saveAll(categories);
        log.info("Seeded 10 default document categories");
    }

    private void seedUsersAndVault() {
        if (userRepository.count() > 0) return;

        log.info("Seeding demo users, vault documents, policies, and emergency workflows...");

        // 1. Admin
        User admin = User.builder()
                .email("admin@lifeledger.com")
                .password(passwordEncoder.encode("Admin@123456"))
                .fullName("System Administrator")
                .phone("+1-555-0100")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .twoFactorEnabled(true)
                .build();
        userRepository.save(admin);

        // 2. Demo User (Owner)
        User user = User.builder()
                .email("user@lifeledger.com")
                .password(passwordEncoder.encode("User@123456"))
                .fullName("Alex Morgan")
                .phone("+1-555-0199")
                .role(Role.ROLE_USER)
                .active(true)
                .twoFactorEnabled(true)
                .build();
        user = userRepository.save(user);

        // 3. Demo Nominee User
        User nomineeUser = User.builder()
                .email("nominee@lifeledger.com")
                .password(passwordEncoder.encode("Nominee@123456"))
                .fullName("Sarah Jenkins")
                .phone("+1-555-0188")
                .role(Role.ROLE_NOMINEE)
                .active(true)
                .twoFactorEnabled(false)
                .build();
        nomineeUser = userRepository.save(nomineeUser);

        // 4. Folders
        Folder vitalFolder = Folder.builder().user(user).name("Vital Records").color("#3B82F6").build();
        Folder propertyFolder = Folder.builder().user(user).name("Property & Assets").color("#10B981").build();
        Folder insuranceFolder = Folder.builder().user(user).name("Insurance Policies").color("#F59E0B").build();
        folderRepository.saveAll(List.of(vitalFolder, propertyFolder, insuranceFolder));

        // 5. Tags
        Tag tagImportant = Tag.builder().user(user).name("Important").color("#EF4444").build();
        Tag tagEmergency = Tag.builder().user(user).name("Emergency").color("#F59E0B").build();
        Tag tagTax = Tag.builder().user(user).name("Tax2026").color("#3B82F6").build();
        tagRepository.saveAll(List.of(tagImportant, tagEmergency, tagTax));

        Category catIdentity = categoryRepository.findByName("Identity").orElse(null);
        Category catInsurance = categoryRepository.findByName("Insurance").orElse(null);
        Category catLegal = categoryRepository.findByName("Legal").orElse(null);
        Category catProperty = categoryRepository.findByName("Property").orElse(null);

        // 6. Encrypted Documents in Vault
        Document doc1 = createEncryptedDemoDoc(user, catIdentity, vitalFolder, "Primary Passport Copy",
                "passport_alex_morgan.pdf", "application/pdf", LocalDate.of(2030, 8, 15),
                "Official passport biometric page scan.", Set.of(tagImportant, tagEmergency));

        Document doc2 = createEncryptedDemoDoc(user, catInsurance, insuranceFolder, "Comprehensive Health Insurance Policy",
                "health_insurance_2026.pdf", "application/pdf", LocalDate.of(2027, 4, 30),
                "Family health insurance coverage policy number POL-998822.", Set.of(tagImportant, tagEmergency));

        Document doc3 = createEncryptedDemoDoc(user, catLegal, vitalFolder, "Last Will and Testament",
                "last_will_testament_signed.pdf", "application/pdf", null,
                "Executed legal will and executor instructions.", Set.of(tagImportant));

        Document doc4 = createEncryptedDemoDoc(user, catProperty, propertyFolder, "Residential Property Title Deed",
                "property_deed_oakridge.pdf", "application/pdf", null,
                "Property registration and deed certificate.", Set.of(tagImportant));

        // 7. Nominee Relationship
        Nominee nominee = Nominee.builder()
                .owner(user)
                .nomineeUser(nomineeUser)
                .name("Sarah Jenkins")
                .email("nominee@lifeledger.com")
                .phone("+1-555-0188")
                .relationship(Nominee.Relationship.SPOUSE)
                .verificationStatus(Nominee.VerificationStatus.VERIFIED)
                .verifiedAt(LocalDateTime.now().minusDays(10))
                .notes("Primary emergency contact and digital legacy co-executor.")
                .build();
        nominee = nomineeRepository.save(nominee);

        // 8. Policy Creation
        Policy policy = Policy.builder()
                .owner(user)
                .nominee(nominee)
                .name("Critical Medical & Insurance Emergency Access")
                .description("Permits emergency retrieval of health insurance and identification in verified medical crises.")
                .waitingPeriodHours(12)
                .approvalType(Policy.ApprovalType.OWNER_OR_ADMIN)
                .accessDurationHours(48)
                .policyExpiryDate(LocalDate.of(2028, 12, 31))
                .active(true)
                .build();
        policy = policyRepository.save(policy);

        PolicyDocument pd1 = PolicyDocument.builder().policy(policy).document(doc1).build();
        PolicyDocument pd2 = PolicyDocument.builder().policy(policy).document(doc2).build();
        policyDocumentRepository.saveAll(List.of(pd1, pd2));
        policy.setPolicyDocuments(List.of(pd1, pd2));

        // 9. Sample Emergency Request
        EmergencyRequest emergReq = EmergencyRequest.builder()
                .nominee(nominee)
                .policy(policy)
                .owner(user)
                .reason("Alex is currently admitted at St. Jude Hospital ICU following an acute medical event. Urgent requirement to present original insurance policy and identity verification.")
                .status(EmergencyRequest.EmergencyStatus.PENDING)
                .requestedAt(LocalDateTime.now().minusHours(2))
                .waitingPeriodEndsAt(LocalDateTime.now().plusHours(10))
                .build();
        emergencyRequestRepository.save(emergReq);

        // 10. Notifications
        Notification n1 = Notification.builder()
                .user(user)
                .title("Emergency Access Request Received")
                .message("Sarah Jenkins has requested emergency access under 'Critical Medical & Insurance Emergency Access'.")
                .type(Notification.NotificationType.EMERGENCY)
                .actionUrl("/emergency-requests")
                .read(false)
                .build();
        Notification n2 = Notification.builder()
                .user(user)
                .title("Vault Initialized")
                .message("Welcome to LifeLedger+. 4 key documents encrypted with AES-256-GCM.")
                .type(Notification.NotificationType.SYSTEM)
                .actionUrl("/vault")
                .read(true)
                .build();
        notificationRepository.saveAll(List.of(n1, n2));

        // 11. Activity Logs
        ActivityLog l1 = ActivityLog.builder()
                .user(user)
                .userEmail(user.getEmail())
                .action(ActivityLog.ActivityAction.REGISTER)
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .targetResource("AUTH")
                .details("Account registered and initialized")
                .build();
        ActivityLog l2 = ActivityLog.builder()
                .user(user)
                .userEmail(user.getEmail())
                .action(ActivityLog.ActivityAction.UPLOAD_DOCUMENT)
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .targetResource("DOC-1")
                .details("Uploaded and encrypted: Primary Passport Copy")
                .build();
        ActivityLog l3 = ActivityLog.builder()
                .user(user)
                .userEmail(user.getEmail())
                .action(ActivityLog.ActivityAction.CREATE_POLICY)
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .targetResource("POLICY-1")
                .details("Configured policy: Critical Medical & Insurance Emergency Access")
                .build();
        activityLogRepository.saveAll(List.of(l1, l2, l3));

        log.info("Demo data seed completed successfully!");
    }

    private Document createEncryptedDemoDoc(User user, Category cat, Folder folder, String title,
                                           String filename, String mime, LocalDate expiry, String notes, Set<Tag> tags) {
        String dummyContent = "%PDF-1.4\n% LIFELEDGER+ SECURE ENCRYPTED VAULT PAYLOAD\nDocument: " + title +
                "\nOwner: " + user.getEmail() + "\nClassification: STRICTLY CONFIDENTIAL\nChecksum Verified.\n";
        byte[] contentBytes = dummyContent.getBytes(StandardCharsets.UTF_8);

        byte[] encryptedBytes = encryptionService.encrypt(contentBytes);
        String storagePath = storageService.storeVaultFile(encryptedBytes, filename);
        String checksum = FileValidationUtils.calculateSha256(contentBytes);

        Document doc = Document.builder()
                .user(user)
                .category(cat)
                .folder(folder)
                .title(title)
                .originalFilename(filename)
                .encryptedStoragePath(storagePath)
                .mimeType(mime)
                .fileSize((long) contentBytes.length)
                .checksumSha256(checksum)
                .favorite(true)
                .archived(false)
                .deleted(false)
                .expiryDate(expiry)
                .notes(notes)
                .extractedMetadataJson("{\"originalFilename\":\"" + filename + "\",\"fileSizeBytes\":" + contentBytes.length + ",\"title\":\"" + title + "\"}")
                .version(1)
                .tags(tags)
                .build();
        doc = documentRepository.save(doc);

        DocumentVersion version = DocumentVersion.builder()
                .document(doc)
                .versionNumber(1)
                .encryptedStoragePath(storagePath)
                .fileSize((long) contentBytes.length)
                .checksumSha256(checksum)
                .changeSummary("Initial seed upload")
                .build();
        versionRepository.save(version);

        return doc;
    }
}
