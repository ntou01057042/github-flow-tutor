package org.example.githubflowtutor.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommandService {
    private final CommandRepository repository;

    @Autowired
    public CommandService(CommandRepository repository) {
        this.repository = repository;
    }

    public void insertCommand(Command command) {
        repository.insert(command);
    }

    public void deleteAllCommands() {
        repository.deleteAll();
    }

    public void insertCommands(List<Command> commands) {
        for (Command c : commands) {
            if (!repository.existsByTimestamp(c.getTimestamp())) {
                repository.insert(c);
            }
        }
    }

    public List<Command> findAllCommands() {
        return repository.findAll(Sort.by(
                Sort.Order.asc("parentTimestamp"),
                Sort.Order.asc("timestamp")
        ));
    }
}
