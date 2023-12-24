package org.example.githubflowtutor.command;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommandRepository extends MongoRepository<Command, String> {
    boolean existsByTimestamp(long timestamp);
}
