package org.example.githubflowtutor.branch;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepository extends MongoRepository<Branch, String> {
    Optional<Branch> findByName(String name);
}
