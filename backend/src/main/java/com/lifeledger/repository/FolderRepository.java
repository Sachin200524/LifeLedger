package com.lifeledger.repository;

import com.lifeledger.entity.Folder;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByUserOrderByCreatedAtDesc(User user);
    Optional<Folder> findByIdAndUser(Long id, User user);
    List<Folder> findByUserAndParentFolderIsNull(User user);
    List<Folder> findByUserAndParentFolder(User user, Folder parentFolder);
}
