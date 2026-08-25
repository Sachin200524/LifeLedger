package com.lifeledger.repository;

import com.lifeledger.entity.Category;
import com.lifeledger.entity.Document;
import com.lifeledger.entity.Folder;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserAndDeletedFalseOrderByCreatedAtDesc(User user);

    List<Document> findByUserAndDeletedTrueOrderByUpdatedAtDesc(User user);

    List<Document> findByUserAndFavoriteTrueAndDeletedFalse(User user);

    List<Document> findByUserAndCategoryAndDeletedFalse(User user, Category category);

    List<Document> findByUserAndFolderAndDeletedFalse(User user, Folder folder);

    Optional<Document> findByIdAndUser(Long id, User user);

    Optional<Document> findByIdAndUserAndDeletedFalse(Long id, User user);

    long countByUserAndDeletedFalse(User user);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM Document d WHERE d.user = :user AND d.deleted = false")
    long sumFileSizeByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM Document d WHERE d.deleted = false")
    long sumTotalStorageUsed();

    long countByDeletedFalse();

    List<Document> findByUserAndExpiryDateBetweenAndDeletedFalse(User user, LocalDate start, LocalDate end);

    List<Document> findByExpiryDateBeforeAndDeletedFalse(LocalDate date);

    @Query("SELECT d.category.name, COUNT(d) FROM Document d WHERE d.user = :user AND d.deleted = false GROUP BY d.category.name")
    List<Object[]> countDocumentsByCategoryForUser(@Param("user") User user);

    @Query("SELECT d.category.name, COUNT(d) FROM Document d WHERE d.deleted = false GROUP BY d.category.name")
    List<Object[]> countDocumentsByCategorySystemWide();

    @Query("SELECT d FROM Document d WHERE d.user = :user AND d.deleted = false AND " +
            "(LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.notes) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchDocuments(@Param("user") User user, @Param("query") String query);
}
