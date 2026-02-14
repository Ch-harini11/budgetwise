package com.example.backend.repository;

import com.example.backend.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile,String>{
    Profile findByUserId(String userId);
}
